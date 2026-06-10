/**
 * Service du temps de jeu.
 * Centralise le temps écoulé et permet de ralentir, d'accélérer
 * ou de mettre le jeu en pause via une simple échelle temporelle.
 */
export class TimeService {
  private tempsTotalInterne = 0;
  private deltaInterne = 0;

  /** Échelle temporelle : 1 = temps réel, 0 = pause. */
  echelle = 1;

  /** Fait avancer le temps de jeu (appelé par la boucle à chaque pas fixe). */
  avancer(deltaSecondes: number): void {
    this.deltaInterne = Math.max(0, deltaSecondes) * this.echelle;
    this.tempsTotalInterne += this.deltaInterne;
  }

  /** Dernier delta de temps de jeu, en secondes. */
  get delta(): number {
    return this.deltaInterne;
  }

  /** Temps de jeu total écoulé, en secondes. */
  get tempsTotal(): number {
    return this.tempsTotalInterne;
  }
}
