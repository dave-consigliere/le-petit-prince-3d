import type { ProgressionService } from '../../game/progression/ProgressionService';
import type { LocalizationManager } from '../../localization/LocalizationManager';

/**
 * Carte des planètes — interface de voyage entre les scènes (Vision §11).
 *
 * Affichage : grille de « planètes » cliquables, verrouillées jusqu'à
 * leur déblocage narratif. Style sobre et poétique, cohérent avec le livre.
 * Le joueur choisit sa destination ; le Bootstrap effectue la transition.
 */

export interface DestinationPlanete {
  id: string;
  nom: string;
  description: string;
  debloquee: boolean;
  couleur: string;
}

export class CartePlanetes {
  private readonly racine: HTMLDivElement;
  private ouverte = false;
  private surChoix: ((id: string) => void) | null = null;

  private static readonly PLANETES: Omit<DestinationPlanete, 'debloquee'>[] = [
    { id: 'b612', nom: 'Astéroïde B-612', description: 'Ta petite planète.', couleur: '#d9a7b0' },
    {
      id: 'planete-roi',
      nom: 'Planète du Roi',
      description: 'Un roi sans sujets.',
      couleur: '#9b7ebf',
    },
    {
      id: 'planete-vaniteux',
      nom: 'Planète du Vaniteux',
      description: 'Un homme qui veut être admiré.',
      couleur: '#e8c060',
    },
    {
      id: 'planete-buveur',
      nom: 'Planète du Buveur',
      description: 'Un homme qui boit pour oublier.',
      couleur: '#8ab4c8',
    },
    {
      id: 'planete-businessman',
      nom: 'Planète du Businessman',
      description: 'Un homme qui compte les étoiles.',
      couleur: '#a8b890',
    },
    {
      id: 'planete-allumeur',
      nom: "Planète de l'Allumeur",
      description: `Un homme fidèle à la consigne.`,
      couleur: '#f0a860',
    },
    {
      id: 'planete-geographe',
      nom: 'Planète du Géographe',
      description: `Un savant qui n'explore jamais.`,
      couleur: '#c8a870',
    },
    {
      id: 'terre',
      nom: 'La Terre',
      description: 'Le désert, le jardin, le Renard…',
      couleur: '#88b880',
    },
  ];

  constructor(
    private readonly progression: ProgressionService,
    private readonly _loc: typeof LocalizationManager,
  ) {
    this.racine = document.createElement('div');
    this.racine.id = 'carte-planetes';
    this.racine.setAttribute('role', 'dialog');
    this.racine.setAttribute('aria-label', 'Carte des planètes');
    this.racine.hidden = true;

    const entete = document.createElement('div');
    entete.className = 'carte-entete';
    const titre = document.createElement('h2');
    titre.textContent = 'Voyage interplanétaire';
    const btnFermer = document.createElement('button');
    btnFermer.className = 'carte-fermer';
    btnFermer.textContent = 'Fermer';
    btnFermer.addEventListener('click', () => this.fermer());
    entete.append(titre, btnFermer);

    const grille = document.createElement('div');
    grille.className = 'carte-grille';
    grille.id = 'carte-grille';

    this.racine.append(entete, grille);
    document.body.appendChild(this.racine);
  }

  /** Définit le callback appelé quand le joueur choisit une planète. */
  surVoyage(cb: (id: string) => void): void {
    this.surChoix = cb;
  }

  basculer(): void {
    if (this.ouverte) this.fermer();
    else this.ouvrir();
  }

  /** Ouvre la carte (appelable depuis l'extérieur). */
  ouvrir(): void {
    this.rafraichir();
    this.racine.hidden = false;
    this.ouverte = true;
  }

  /** Ferme la carte (appelable depuis l'extérieur). */
  fermer(): void {
    this.racine.hidden = true;
    this.ouverte = false;
  }

  get estOuverte(): boolean {
    return this.ouverte;
  }

  liberer(): void {
    this.racine.remove();
  }

  // ---------------------------------------------------------------- privé --

  rafraichir(): void {
    const grille = document.getElementById('carte-grille');
    if (!grille) return;
    grille.innerHTML = '';

    for (const planete of CartePlanetes.PLANETES) {
      const debloquee = this.progression.estDebloque(planete.id);
      const carte = document.createElement('button');
      carte.className = `carte-planete${debloquee ? '' : ' carte-planete--verrouillee'}`;
      carte.setAttribute('aria-label', debloquee ? planete.nom : `${planete.nom} (verrouillée)`);
      carte.disabled = !debloquee;

      // Globe coloré
      const globe = document.createElement('div');
      globe.className = 'carte-globe';
      globe.style.background = debloquee ? planete.couleur : '#888';

      const nom = document.createElement('span');
      nom.className = 'carte-nom';
      nom.textContent = planete.nom;

      const desc = document.createElement('span');
      desc.className = 'carte-desc';
      desc.textContent = debloquee ? planete.description : '???';

      carte.append(globe, nom, desc);
      if (debloquee) {
        carte.addEventListener('click', () => {
          this.fermer();
          this.surChoix?.(planete.id);
        });
      }
      grille.appendChild(carte);
    }
  }
}
