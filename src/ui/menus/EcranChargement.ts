/**
 * Écran de chargement affiché lors des transitions entre scènes (M6).
 *
 * Conception : sobre, contemplatif, cohérent avec l'esthétique aquarelle.
 * Fond crème, citation poétique en italique, indicateur discret.
 * Apparition et disparition en fondu pour ne pas casser l'immersion.
 */

const CITATIONS = [
  `« On ne voit bien qu'avec le cœur. »`,
  `« L'essentiel est invisible pour les yeux. »`,
  `« Toutes les grandes personnes ont d'abord été des enfants. »`,
  `« Les étoiles sont belles à cause d'une fleur que l'on ne voit pas. »`,
  `« Il faut exiger de chacun ce que chacun peut donner. »`,
  `« On est seul aussi chez les hommes. »`,
  `« Si tu m'apprivoises, nous aurons besoin l'un de l'autre. »`,
] as const;

export class EcranChargement {
  private readonly racine: HTMLDivElement;
  private readonly citation: HTMLDivElement;
  private affiche = false;

  constructor() {
    this.racine = document.createElement('div');
    this.racine.id = 'ecran-chargement';
    this.racine.hidden = true;
    this.racine.setAttribute('role', 'status');
    this.racine.setAttribute('aria-live', 'polite');

    const conteneur = document.createElement('div');
    conteneur.className = 'chargement-conteneur';

    this.citation = document.createElement('div');
    this.citation.className = 'chargement-citation';

    const indicateur = document.createElement('div');
    indicateur.className = 'chargement-indicateur';
    indicateur.setAttribute('aria-label', 'Chargement en cours');

    conteneur.append(this.citation, indicateur);
    this.racine.appendChild(conteneur);
    document.body.appendChild(this.racine);
  }

  /** Affiche l'écran avec une citation aléatoire. */
  afficher(): void {
    if (this.affiche) return;
    this.affiche = true;
    const choix = CITATIONS[Math.floor(Math.random() * CITATIONS.length)] ?? CITATIONS[0]!;
    this.citation.textContent = choix;
    this.racine.hidden = false;
    // Forcer un reflow puis activer le fondu (sinon transition ratée)
    void this.racine.offsetWidth;
    this.racine.classList.add('visible');
  }

  /** Masque l'écran avec un fondu. */
  masquer(): void {
    if (!this.affiche) return;
    this.affiche = false;
    this.racine.classList.remove('visible');
    setTimeout(() => {
      if (!this.affiche) this.racine.hidden = true;
    }, 400);
  }

  get estAffiche(): boolean {
    return this.affiche;
  }
}
