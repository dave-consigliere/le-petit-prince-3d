import type { EventBus } from '../engine/EventBus';
import type { EvenementsJeu } from '../game/Evenements';
import { Logger } from '../utilities/Logger';

/**
 * Gestionnaire audio (Architecture.md §5 — audio/).
 *
 * Mélodie procédurale via oscillateurs Web Audio natifs :
 * zéro calcul CPU, son garanti dès le déblocage du contexte.
 * Style « boîte à musique » pentatonique — doux, contemplatif.
 */
export class AudioManager {
  private contexte: AudioContext | null = null;
  private gainMusique: GainNode | null = null;
  private gainAmbiance: GainNode | null = null;

  private gainMusiqueCourant: GainNode | null = null;
  private sourceAmbiance: OscillatorNode | null = null;
  private oscillateursActifs: OscillatorNode[] = [];

  private _volumeMusique = 0.35;
  private _volumeAmbiance = 0.12;
  private _muet = false;

  /** Piste à jouer dès que le contexte sera débloqué. */
  private pisteEnAttente: { piste: string; fondu: number } | null = null;

  constructor(private readonly evenements: EventBus<EvenementsJeu>) {
    this.evenements.abonner('audio:musique', ({ piste, fondu }) => {
      if (this.contexte?.state === 'running') {
        void this.jouerMusique(piste, fondu);
      } else {
        this.pisteEnAttente = { piste, fondu };
      }
    });
  }

  /** À appeler au premier geste utilisateur. */
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

  /** Ambiance sonore de la scène (oscillateur grave en boucle). */
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

  /** Thème musical avec crossfade — oscillateurs natifs, zéro calcul CPU. */
  async jouerMusique(piste: string, dureeFondu = 2): Promise<void> {
    if (!this.contexte || !this.gainMusique) return;
    if (this.contexte.state !== 'running') {
      this.pisteEnAttente = { piste, fondu: dureeFondu };
      return;
    }

    // Fondu sortant des oscillateurs précédents.
    if (this.gainMusiqueCourant) {
      const g = this.gainMusiqueCourant;
      const t = this.contexte.currentTime;
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.linearRampToValueAtTime(0, t + dureeFondu);
      const anciens = this.oscillateursActifs.splice(0);
      setTimeout(
        () => {
          for (const osc of anciens) {
            try {
              osc.stop();
            } catch {
              /* ok */
            }
          }
        },
        (dureeFondu + 0.3) * 1000,
      );
    }

    // Fondu entrant.
    const gainEntrant = this.contexte.createGain();
    gainEntrant.gain.setValueAtTime(0, this.contexte.currentTime);
    gainEntrant.gain.linearRampToValueAtTime(1, this.contexte.currentTime + dureeFondu);
    gainEntrant.connect(this.gainMusique);
    this.gainMusiqueCourant = gainEntrant;

    this.demarrerOscillateurs(piste, gainEntrant);
    Logger.info(`Musique : ${piste}`);
  }

  liberer(): void {
    for (const osc of this.oscillateursActifs) {
      try {
        osc.stop();
      } catch {
        /* ok */
      }
    }
    try {
      this.sourceAmbiance?.stop();
    } catch {
      /* ok */
    }
    void this.contexte?.close();
    this.contexte = null;
  }

  // ---------------------------------------------------------------- privé --

  /**
   * Démarre une mélodie « boîte à musique » via oscillateurs Web Audio.
   * Gamme pentatonique → aucune dissonance.
   * Enveloppes ADSR programmées sur 16 répétitions (~ 2 minutes).
   */
  private demarrerOscillateurs(piste: string, destination: AudioNode): void {
    if (!this.contexte) return;

    const notesDesert = [261.63, 329.63, 392.0, 523.25, 659.25];
    const notesB612 = [293.66, 370.0, 440.0, 587.33, 740.0];
    const notes = piste.includes('b612') ? notesB612 : notesDesert;

    // Décalages temporels entre les notes de la séquence (en secondes).
    const decalages = [0, 1.4, 2.6, 4.2, 5.5];
    const dureeNote = 3.5;
    const periode = 7.0;

    this.oscillateursActifs = [];

    for (let i = 0; i < notes.length; i++) {
      const freq = notes[i] ?? 440;
      const decalage = decalages[i] ?? 0;

      const osc = this.contexte.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const env = this.contexte.createGain();
      env.gain.value = 0;

      const maintenant = this.contexte.currentTime + 0.1;
      for (let rep = 0; rep < 16; rep++) {
        const debut = maintenant + decalage + rep * periode;
        env.gain.setValueAtTime(0, debut);
        env.gain.linearRampToValueAtTime(0.055, debut + 0.08);
        env.gain.exponentialRampToValueAtTime(0.001, debut + dureeNote);
      }

      osc.connect(env);
      env.connect(destination);
      osc.start();
      this.oscillateursActifs.push(osc);
    }
  }
}
