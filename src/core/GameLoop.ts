import { Logger } from '../utilities/Logger';

/** Callback de mise à jour logique, appelé à pas fixe. */
export type CallbackMiseAJour = (dtFixe: number) => void;

/**
 * Callback de rendu, appelé une fois par image.
 * @param interpolation fraction du pas fixe restant (utile pour interpoler).
 * @param dt durée réelle de l'image, en secondes.
 */
export type CallbackRendu = (interpolation: number, dt: number) => void;

/**
 * Boucle principale du jeu (Architecture.md §5 — core/).
 * Modèle classique « pas fixe + rendu variable » :
 * la logique tourne à fréquence constante (déterminisme, stabilité),
 * le rendu suit la cadence du navigateur via requestAnimationFrame.
 */
export class GameLoop {
  private identifiantRAF: number | null = null;
  private dernierInstant = 0;
  private accumulateur = 0;
  private readonly pasFixe: number;

  /** Delta plafonné pour éviter la « spirale de la mort » après un onglet inactif. */
  private static readonly DELTA_MAXIMAL = 0.25;

  constructor(
    misesAJourParSeconde: number,
    private readonly surMiseAJour: CallbackMiseAJour,
    private readonly surRendu: CallbackRendu,
  ) {
    this.pasFixe = 1 / misesAJourParSeconde;
  }

  /** Démarre la boucle. Idempotent : un second appel est ignoré. */
  demarrer(): void {
    if (this.identifiantRAF !== null) return;
    this.dernierInstant = performance.now();

    const pas = (instant: number): void => {
      this.identifiantRAF = requestAnimationFrame(pas);

      let dt = (instant - this.dernierInstant) / 1000;
      this.dernierInstant = instant;
      if (dt > GameLoop.DELTA_MAXIMAL) dt = GameLoop.DELTA_MAXIMAL;

      this.accumulateur += dt;
      while (this.accumulateur >= this.pasFixe) {
        this.surMiseAJour(this.pasFixe);
        this.accumulateur -= this.pasFixe;
      }

      this.surRendu(this.accumulateur / this.pasFixe, dt);
    };

    this.identifiantRAF = requestAnimationFrame(pas);
    Logger.info('Boucle de jeu démarrée.');
  }

  /** Arrête proprement la boucle. */
  arreter(): void {
    if (this.identifiantRAF !== null) {
      cancelAnimationFrame(this.identifiantRAF);
      this.identifiantRAF = null;
      Logger.info('Boucle de jeu arrêtée.');
    }
  }
}
