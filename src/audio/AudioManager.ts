import type { EventBus } from '../engine/EventBus';
import type { EvenementsJeu } from '../game/Evenements';
import { Logger } from '../utilities/Logger';

/**
 * Gestionnaire audio (Architecture.md §5 — audio/).
 *
 * Corrections M2 → M2.1 :
 *   - le contexte AudioContext est créé à l'intérieur de debloquer() et non
 *     dans le constructeur : certains navigateurs refusent un contexte créé
 *     avant un geste même si resume() est appelé ensuite ;
 *   - debloquer() appelle context.resume() explicitement (Chrome le suspend
 *     parfois même après création sur geste) ;
 *   - jouerMusique() vérifie que le contexte est dans l'état « running »
 *     avant de démarrer une source.
 */
export class AudioManager {
  private contexte: AudioContext | null = null;
  private gainMusique: GainNode | null = null;
  private gainAmbiance: GainNode | null = null;

  private sourceMusique: AudioBufferSourceNode | null = null;
  private gainMusiqueCourant: GainNode | null = null;
  private sourceAmbiance: OscillatorNode | null = null;

  private _volumeMusique = 0.35;
  private _volumeAmbiance = 0.12;
  private _muet = false;

  /** File d'attente : piste à jouer dès que le contexte sera disponible. */
  private pisteEnAttente: { piste: string; fondu: number } | null = null;

  constructor(private readonly evenements: EventBus<EvenementsJeu>) {
    this.evenements.abonner('audio:musique', ({ piste, fondu }) => {
      if (this.contexte?.state === 'running') {
        void this.jouerMusique(piste, fondu);
      } else {
        // Mémorise la demande, jouée dès le déblocage.
        this.pisteEnAttente = { piste, fondu };
      }
    });
  }

  /**
   * À appeler au premier geste utilisateur (clic, touche).
   * Crée le contexte s'il n'existe pas encore et le reprend s'il est suspendu.
   */
  async debloquer(): Promise<void> {
    if (!this.contexte) {
      this.contexte = new AudioContext();

      this.gainMusique = this.contexte.createGain();
      this.gainMusique.gain.value = this._volumeMusique;
      this.gainMusique.connect(this.contexte.destination);

      this.gainAmbiance = this.contexte.createGain();
      this.gainAmbiance.gain.value = this._volumeAmbiance;
      this.gainAmbiance.connect(this.contexte.destination);

      Logger.info('Contexte AudioContext créé.');
    }

    if (this.contexte.state === 'suspended') {
      await this.contexte.resume();
      Logger.info('AudioContext repris.');
    }

    // Joue la piste en attente éventuellement mise en file pendant le chargement.
    if (this.pisteEnAttente && this.contexte.state === 'running') {
      const { piste, fondu } = this.pisteEnAttente;
      this.pisteEnAttente = null;
      await this.jouerMusique(piste, fondu);
    }
  }

  set volumeMusique(v: number) {
    this._volumeMusique = Math.max(0, Math.min(1, v));
    if (this.gainMusique) this.gainMusique.gain.value = this._muet ? 0 : this._volumeMusique;
  }

  set volumeAmbiance(v: number) {
    this._volumeAmbiance = Math.max(0, Math.min(1, v));
    if (this.gainAmbiance) this.gainAmbiance.gain.value = this._muet ? 0 : this._volumeAmbiance;
  }

  set muet(valeur: boolean) {
    this._muet = valeur;
    if (this.gainMusique) this.gainMusique.gain.value = valeur ? 0 : this._volumeMusique;
    if (this.gainAmbiance) this.gainAmbiance.gain.value = valeur ? 0 : this._volumeAmbiance;
  }
  get muet(): boolean {
    return this._muet;
  }

  /** Démarre l'ambiance sonore d'une scène (oscillateur de synthèse). */
  jouerAmbiance(type: 'desert' | 'espace' | 'silence'): void {
    if (!this.contexte || !this.gainAmbiance) return;
    this.sourceAmbiance?.stop();
    this.sourceAmbiance = null;
    if (type === 'silence') return;

    const osc = this.contexte.createOscillator();
    const filtre = this.contexte.createBiquadFilter();
    filtre.type = 'lowpass';
    if (type === 'desert') {
      osc.type = 'sawtooth';
      osc.frequency.value = 55;
      filtre.frequency.value = 200;
    } else {
      osc.type = 'sine';
      osc.frequency.value = 28;
      filtre.frequency.value = 80;
    }
    const fade = this.contexte.createGain();
    fade.gain.setValueAtTime(0, this.contexte.currentTime);
    fade.gain.linearRampToValueAtTime(0.06, this.contexte.currentTime + 3);
    osc.connect(filtre);
    filtre.connect(fade);
    fade.connect(this.gainAmbiance);
    osc.start();
    this.sourceAmbiance = osc;
  }

  /** Lance un thème musical avec crossfade. Nécessite le contexte débloqué. */
  async jouerMusique(piste: string, dureeFondu = 2): Promise<void> {
    if (!this.contexte || !this.gainMusique) return;
    if (this.contexte.state !== 'running') {
      this.pisteEnAttente = { piste, fondu: dureeFondu };
      return;
    }

    // Fondu sortant.
    if (this.gainMusiqueCourant) {
      const g = this.gainMusiqueCourant;
      g.gain.linearRampToValueAtTime(0, this.contexte.currentTime + dureeFondu);
      const src = this.sourceMusique;
      setTimeout(
        () => {
          try {
            src?.stop();
          } catch {
            /* déjà stoppé */
          }
        },
        (dureeFondu + 0.2) * 1000,
      );
    }

    const buffer = this.genererMelodie(piste);
    if (!buffer) return;

    const gainEntrant = this.contexte.createGain();
    gainEntrant.gain.setValueAtTime(0, this.contexte.currentTime);
    gainEntrant.gain.linearRampToValueAtTime(1, this.contexte.currentTime + dureeFondu);
    gainEntrant.connect(this.gainMusique);

    const source = this.contexte.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gainEntrant);
    source.start();

    this.sourceMusique = source;
    this.gainMusiqueCourant = gainEntrant;
    Logger.info(`Musique : ${piste}`);
  }

  liberer(): void {
    try {
      this.sourceMusique?.stop();
    } catch {
      /* déjà stoppé */
    }
    try {
      this.sourceAmbiance?.stop();
    } catch {
      /* déjà stoppé */
    }
    void this.contexte?.close();
    this.contexte = null;
  }

  // ---------------------------------------------------------------- privé --

  private genererMelodie(piste: string): AudioBuffer | null {
    if (!this.contexte) return null;
    const duree = 8;
    const taux = this.contexte.sampleRate;
    const buffer = this.contexte.createBuffer(1, taux * duree, taux);
    const donnees = buffer.getChannelData(0);
    const notes = piste.includes('b612')
      ? [293.66, 349.23, 392.0, 440.0, 523.25]
      : [261.63, 293.66, 329.63, 392.0, 440.0];

    for (let i = 0; i < donnees.length; i++) {
      const t = i / taux;
      let echantillon = 0;
      for (let h = 0; h < notes.length; h++) {
        const freq = notes[h] ?? 440;
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
