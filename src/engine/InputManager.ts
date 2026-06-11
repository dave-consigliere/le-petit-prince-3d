/**
 * Gestionnaire des entrées clavier et pointeur.
 * Les autres modules interrogent un état consolidé plutôt que d'écouter
 * eux-mêmes les événements du navigateur (séparation des préoccupations).
 *
 * Note claviers : les touches sont identifiées par leur code PHYSIQUE
 * (« KeyW » désigne la touche Z d'un clavier AZERTY) : ZQSD et WASD
 * fonctionnent donc automatiquement, et les flèches sont aussi gérées.
 */
export class InputManager {
  private readonly touches = new Set<string>();
  private readonly pressions = new Set<string>();
  private readonly boutonsPointeur = new Set<number>();
  private readonly deltaPointeurInterne = { x: 0, y: 0 };
  private deltaMoletteInterne = 0;

  /** Position normalisée du pointeur dans [-1 ; 1] (convention WebGL). */
  readonly pointeur = { x: 0, y: 0, actif: false };

  private readonly surToucheEnfoncee = (evenement: KeyboardEvent): void => {
    this.touches.add(evenement.code);
    // Front montant uniquement : la répétition automatique est ignorée.
    if (!evenement.repeat) this.pressions.add(evenement.code);
  };

  private readonly surToucheRelachee = (evenement: KeyboardEvent): void => {
    this.touches.delete(evenement.code);
  };

  private readonly surBoutonEnfonce = (evenement: PointerEvent): void => {
    this.boutonsPointeur.add(evenement.button);
  };

  private readonly surBoutonRelache = (evenement: PointerEvent): void => {
    this.boutonsPointeur.delete(evenement.button);
  };

  private readonly surDeplacementPointeur = (evenement: PointerEvent): void => {
    this.pointeur.x = (evenement.clientX / window.innerWidth) * 2 - 1;
    this.pointeur.y = -(evenement.clientY / window.innerHeight) * 2 + 1;
    this.pointeur.actif = true;
    // Le glissement (orbite caméra) n'est accumulé que bouton gauche maintenu.
    if (this.boutonsPointeur.has(0)) {
      this.deltaPointeurInterne.x += evenement.movementX;
      this.deltaPointeurInterne.y += evenement.movementY;
    }
  };

  private readonly surMolette = (evenement: WheelEvent): void => {
    this.deltaMoletteInterne += evenement.deltaY;
  };

  private readonly surPerteFocus = (): void => {
    this.touches.clear();
    this.pressions.clear();
    this.boutonsPointeur.clear();
  };

  constructor() {
    window.addEventListener('keydown', this.surToucheEnfoncee);
    window.addEventListener('keyup', this.surToucheRelachee);
    window.addEventListener('pointerdown', this.surBoutonEnfonce);
    window.addEventListener('pointerup', this.surBoutonRelache);
    window.addEventListener('pointermove', this.surDeplacementPointeur);
    window.addEventListener('wheel', this.surMolette, { passive: true });
    window.addEventListener('blur', this.surPerteFocus);
  }

  /** Indique si une touche (code physique, ex. « KeyW ») est enfoncée. */
  estEnfoncee(code: string): boolean {
    return this.touches.has(code);
  }

  /** Axe gauche/droite ∈ {-1, 0, 1} (Q/D, A/D physique, flèches). */
  axeHorizontal(): number {
    const droite = this.estEnfoncee('KeyD') || this.estEnfoncee('ArrowRight') ? 1 : 0;
    const gauche = this.estEnfoncee('KeyA') || this.estEnfoncee('ArrowLeft') ? 1 : 0;
    return droite - gauche;
  }

  /** Axe avant/arrière ∈ {-1, 0, 1} (Z/S, W/S physique, flèches). */
  axeVertical(): number {
    const avant = this.estEnfoncee('KeyW') || this.estEnfoncee('ArrowUp') ? 1 : 0;
    const arriere = this.estEnfoncee('KeyS') || this.estEnfoncee('ArrowDown') ? 1 : 0;
    return avant - arriere;
  }

  /** Course active (touche Maj). */
  courseActive(): boolean {
    return this.estEnfoncee('ShiftLeft') || this.estEnfoncee('ShiftRight');
  }

  /**
   * Récupère puis remet à zéro le glissement de pointeur accumulé.
   * Le résultat est écrit dans l'objet fourni (zéro allocation par image).
   */
  consommerDeltaPointeur(resultat: { x: number; y: number }): void {
    resultat.x = this.deltaPointeurInterne.x;
    resultat.y = this.deltaPointeurInterne.y;
    this.deltaPointeurInterne.x = 0;
    this.deltaPointeurInterne.y = 0;
  }

  /** Récupère puis remet à zéro le défilement de molette accumulé. */
  consommerDeltaMolette(): number {
    const delta = this.deltaMoletteInterne;
    this.deltaMoletteInterne = 0;
    return delta;
  }

  /**
   * Consomme une pression unique de touche (vraie une seule fois par appui).
   * Utilisé pour les actions ponctuelles : interagir, ouvrir le journal...
   */
  consommerPression(code: string): boolean {
    if (this.pressions.has(code)) {
      this.pressions.delete(code);
      return true;
    }
    return false;
  }

  /** Vide les pressions non consommées (appelé en fin de pas de jeu). */
  viderPressions(): void {
    this.pressions.clear();
  }

  /** Détache les écouteurs (libération des ressources). */
  liberer(): void {
    window.removeEventListener('keydown', this.surToucheEnfoncee);
    window.removeEventListener('keyup', this.surToucheRelachee);
    window.removeEventListener('pointerdown', this.surBoutonEnfonce);
    window.removeEventListener('pointerup', this.surBoutonRelache);
    window.removeEventListener('pointermove', this.surDeplacementPointeur);
    window.removeEventListener('wheel', this.surMolette);
    window.removeEventListener('blur', this.surPerteFocus);
    this.touches.clear();
    this.boutonsPointeur.clear();
  }
}
