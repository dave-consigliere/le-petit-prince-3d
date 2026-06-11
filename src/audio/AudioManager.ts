import type { EventBus } from '../engine/EventBus';
import type { EvenementsJeu } from '../game/Evenements';
import { Logger } from '../utilities/Logger';

/**
 * Gestionnaire audio (Architecture.md §5 — audio/, Vision §6).
 *
 * Architecture à quatre bus :
 *   musique   – thème de fond, crossfade automatique ;
 *   ambiance  – sons d'environnement en boucle (vent, espace…) ;
 *   sfx       – effets ponctuels (interaction, interface…) ;
 *   ui        – sons d'interface.
 *
 * Web Audio API pure : aucune bibliothèque externe.
 * Le contexte n'est créé qu'après un geste de l'utilisateur (politique
 * autoplay des navigateurs modernes).
 *
 * Au jalon M2 : les pistes audio sont des oscillateurs de synthèse
 * (aucun fichier à charger). Les vraies musiques arrivent au jalon M6.
 */
export class AudioManager {
  private contexte: AudioContext | null = null;
  private readonly gainMaître: { musique: GainNode | null; ambiance: GainNode | null } = {
    musique: null,
    ambiance: null,
  };

  /** Source de la musique en cours (pour le crossfade). */
  private sourceMusique: AudioBufferSourceNode | OscillatorNode | null = null;
  private gainMusiqueCourant: GainNode | null = null;

  /** Source de l'ambiance en cours. */
  private sourceAmbiance: OscillatorNode | null = null;

  private _volumeMusique = 0.35;
  private _volumeAmbiance = 0.12;
  private _muet = false;

  constructor(private readonly evenements: EventBus<EvenementsJeu>) {
    this.evenements.abonner('audio:musique', ({ piste, fondu }) => {
      void this.jouerMusique(piste, fondu);
    });
  }

  /** Initialise le contexte audio après le premier geste utilisateur. */
  debloquer(): void {
    if (this.contexte) return;
    this.contexte = new AudioContext();
    this.gainMaître.musique = this.contexte.createGain();
    this.gainMaître.musique.gain.value = this._volumeMusique;
    this.gainMaître.musique.connect(this.contexte.destination);

    this.gainMaître.ambiance = this.contexte.createGain();
    this.gainMaître.ambiance.gain.value = this._volumeAmbiance;
    this.gainMaître.ambiance.connect(this.contexte.destination);

    Logger.info('Contexte audio initialisé.');
  }

  /** Volume musique [0 ; 1]. */
  set volumeMusique(v: number) {
    this._volumeMusique = Math.max(0, Math.min(1, v));
    if (this.gainMaître.musique) this.gainMaître.musique.gain.value = this._volumeMusique;
  }

  /** Volume ambiance [0 ; 1]. */
  set volumeAmbiance(v: number) {
    this._volumeAmbiance = Math.max(0, Math.min(1, v));
    if (this.gainMaître.ambiance) this.gainMaître.ambiance.gain.value = this._volumeAmbiance;
  }

  /** Coupe / réactive le son global. */
  set muet(valeur: boolean) {
    this._muet = valeur;
    if (!this.contexte) return;
    this.contexte.destination.channelInterpretation = 'speakers';
    if (this.gainMaître.musique)
      this.gainMaître.musique.gain.value = valeur ? 0 : this._volumeMusique;
    if (this.gainMaître.ambiance)
      this.gainMaître.ambiance.gain.value = valeur ? 0 : this._volumeAmbiance;
  }

  get muet(): boolean {
    return this._muet;
  }

  /**
   * Démarre l'ambiance sonore d'une scène.
   * Jalon M2 : oscillateur basse fréquence (vent / espace) en synthèse.
   */
  jouerAmbiance(type: 'desert' | 'espace' | 'silence'): void {
    if (!this.contexte || !this.gainMaître.ambiance) return;
    this.sourceAmbiance?.stop();

    if (type === 'silence') return;

    const osc = this.contexte.createOscillator();
    const filtre = this.contexte.createBiquadFilter();
    filtre.type = 'lowpass';

    if (type === 'desert') {
      osc.type = 'sawtooth';
      osc.frequency.value = 55;
      filtre.frequency.value = 200;
    } else {
      // espace : souffle très grave et doux
      osc.type = 'sine';
      osc.frequency.value = 28;
      filtre.frequency.value = 80;
    }

    const gainFade = this.contexte.createGain();
    gainFade.gain.setValueAtTime(0, this.contexte.currentTime);
    gainFade.gain.linearRampToValueAtTime(0.06, this.contexte.currentTime + 3);

    osc.connect(filtre);
    filtre.connect(gainFade);
    gainFade.connect(this.gainMaître.ambiance);
    osc.start();
    this.sourceAmbiance = osc;
  }

  /**
   * Lance un thème musical avec crossfade.
   * Jalon M2 : mélodie procédurale (sinusoïdes harmoniques, style boîte à musique).
   * Les vraies pistes audio arrivent au jalon M6.
   */
  async jouerMusique(piste: string, dureeFondu = 2): Promise<void> {
    if (!this.contexte || !this.gainMaître.musique) return;

    // Fondu sortant de l'ancienne musique.
    if (this.gainMusiqueCourant) {
      const g = this.gainMusiqueCourant;
      g.gain.linearRampToValueAtTime(0, this.contexte.currentTime + dureeFondu);
      setTimeout(
        () => {
          this.sourceMusique?.stop?.();
          this.sourceMusique = null;
        },
        dureeFondu * 1000 + 100,
      );
    }

    const buffer = this.genererMelodie(piste);
    if (!buffer) return;

    const gainEntrant = this.contexte.createGain();
    gainEntrant.gain.setValueAtTime(0, this.contexte.currentTime);
    gainEntrant.gain.linearRampToValueAtTime(1, this.contexte.currentTime + dureeFondu);
    gainEntrant.connect(this.gainMaître.musique);

    const source = this.contexte.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gainEntrant);
    source.start();

    this.sourceMusique = source;
    this.gainMusiqueCourant = gainEntrant;
    Logger.debogage(`Musique démarrée : ${piste}`);
  }

  liberer(): void {
    this.sourceMusique?.stop?.();
    this.sourceAmbiance?.stop();
    void this.contexte?.close();
    this.contexte = null;
  }

  // ---------------------------------------------------------------- privé --

  /**
   * Génère un court buffer audio procédural selon la piste demandée.
   * Style « boîte à musique » : sinusoïdes harmoniques, tempo lent.
   * Intention : évoquer le calme et la poésie sans distraire.
   */
  private genererMelodie(piste: string): AudioBuffer | null {
    if (!this.contexte) return null;
    const duree = 8; // secondes avant la boucle
    const taux = this.contexte.sampleRate;
    const buffer = this.contexte.createBuffer(1, taux * duree, taux);
    const donnees = buffer.getChannelData(0);

    // Gammes pentatoniques (évitent les dissonances, cohérentes avec la douceur).
    const notesDesert = [261.63, 293.66, 329.63, 392.0, 440.0]; // Do, Ré, Mi, Sol, La
    const notesB612 = [293.66, 349.23, 392.0, 440.0, 523.25]; // Ré, Fa, Sol, La, Do
    const notes = piste.includes('b612') ? notesB612 : notesDesert;

    for (let i = 0; i < donnees.length; i++) {
      const t = i / taux;
      let echantillon = 0;
      for (let h = 0; h < notes.length; h++) {
        const freq = notes[h] ?? 440;
        // Chaque note sonne à intervalles réguliers, avec un léger décalage.
        const phase = (t * 0.5 + h * 0.4) % duree;
        const attaque = Math.min(phase * 20, 1);
        const declin = Math.max(1 - phase * 4, 0);
        echantillon += Math.sin(2 * Math.PI * freq * t) * attaque * declin * 0.04;
      }
      donnees[i] = echantillon;
    }
    return buffer;
  }
}
