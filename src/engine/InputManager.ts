/**
 * Gestionnaire des entrées clavier et pointeur.
 * Les autres modules interrogent un état consolidé plutôt que d'écouter
 * eux-mêmes les événements du navigateur (séparation des préoccupations).
 */
export class InputManager {
  private readonly touches = new Set<string>();

  /** Position normalisée du pointeur dans [-1 ; 1] (convention WebGL). */
  readonly pointeur = { x: 0, y: 0, actif: false };

  private readonly surToucheEnfoncee = (evenement: KeyboardEvent): void => {
    this.touches.add(evenement.code);
  };

  private readonly surToucheRelachee = (evenement: KeyboardEvent): void => {
    this.touches.delete(evenement.code);
  };

  private readonly surDeplacementPointeur = (evenement: PointerEvent): void => {
    this.pointeur.x = (evenement.clientX / window.innerWidth) * 2 - 1;
    this.pointeur.y = -(evenement.clientY / window.innerHeight) * 2 + 1;
    this.pointeur.actif = true;
  };

  constructor() {
    window.addEventListener('keydown', this.surToucheEnfoncee);
    window.addEventListener('keyup', this.surToucheRelachee);
    window.addEventListener('pointermove', this.surDeplacementPointeur);
    // Sécurité : si la fenêtre perd le focus, on relâche tout.
    window.addEventListener('blur', () => this.touches.clear());
  }

  /** Indique si une touche (code physique, ex. « KeyW ») est enfoncée. */
  estEnfoncee(code: string): boolean {
    return this.touches.has(code);
  }

  /** Détache les écouteurs (libération des ressources). */
  liberer(): void {
    window.removeEventListener('keydown', this.surToucheEnfoncee);
    window.removeEventListener('keyup', this.surToucheRelachee);
    window.removeEventListener('pointermove', this.surDeplacementPointeur);
    this.touches.clear();
  }
}
