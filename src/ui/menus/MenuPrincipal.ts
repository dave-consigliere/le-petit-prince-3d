import type { SaveManager } from '../../save/SaveManager';

/**
 * Menu principal — premier écran du jeu (M6).
 *
 * Trois actions : Nouvelle partie, Continuer (si sauvegarde existe),
 * Paramètres. Le bouton Continuer est désactivé sinon.
 * Navigation clavier (Tab, Entrée, flèches) et focus visible.
 */

export class MenuPrincipal {
  private readonly racine: HTMLDivElement;
  private readonly btnContinuer: HTMLButtonElement;

  private callbackNouvellePartie: (() => void) | null = null;
  private callbackContinuer: (() => void) | null = null;
  private callbackParametres: (() => void) | null = null;

  constructor(private readonly save: SaveManager) {
    this.racine = document.createElement('div');
    this.racine.id = 'menu-principal';
    this.racine.hidden = true;
    this.racine.setAttribute('role', 'dialog');
    this.racine.setAttribute('aria-label', 'Menu principal');

    const titre = document.createElement('h1');
    titre.className = 'menu-titre';
    titre.textContent = 'Le Petit Prince';

    const soustitre = document.createElement('div');
    soustitre.className = 'menu-soustitre';
    soustitre.textContent = 'Une aventure interactive 3D';

    const citation = document.createElement('div');
    citation.className = 'menu-citation';
    citation.innerHTML = "« Toutes les grandes personnes<br>ont d'abord été des enfants… »";

    const boutons = document.createElement('div');
    boutons.className = 'menu-boutons';

    const btnNouveau = this.creerBouton('Nouvelle partie', () => this.callbackNouvellePartie?.());
    this.btnContinuer = this.creerBouton('Continuer', () => this.callbackContinuer?.());
    const btnParams = this.creerBouton('Paramètres', () => this.callbackParametres?.());

    boutons.append(btnNouveau, this.btnContinuer, btnParams);
    this.racine.append(titre, soustitre, citation, boutons);
    document.body.appendChild(this.racine);
  }

  ouvrir(): void {
    this.btnContinuer.disabled = !this.save.existeSauvegarde();
    this.btnContinuer.classList.toggle('bouton-desactive', this.btnContinuer.disabled);
    this.racine.hidden = false;
    // Focus sur le premier bouton actif
    requestAnimationFrame(() => {
      const premier = this.racine.querySelector<HTMLButtonElement>('button:not(:disabled)');
      premier?.focus();
    });
  }

  fermer(): void {
    this.racine.hidden = true;
  }

  surNouvellePartie(cb: () => void): void {
    this.callbackNouvellePartie = cb;
  }
  surContinuer(cb: () => void): void {
    this.callbackContinuer = cb;
  }
  surParametres(cb: () => void): void {
    this.callbackParametres = cb;
  }

  private creerBouton(libelle: string, action: () => void): HTMLButtonElement {
    const b = document.createElement('button');
    b.className = 'menu-bouton';
    b.textContent = libelle;
    b.addEventListener('click', action);
    return b;
  }
}
