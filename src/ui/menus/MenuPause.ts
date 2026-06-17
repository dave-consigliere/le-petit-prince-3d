/**
 * Menu pause (Échap pendant une partie) — M6.
 * Reprendre, Paramètres, Retour au menu principal.
 */

export class MenuPause {
  private readonly racine: HTMLDivElement;
  private callbackReprendre: (() => void) | null = null;
  private callbackParametres: (() => void) | null = null;
  private callbackMenuPrincipal: (() => void) | null = null;

  constructor() {
    this.racine = document.createElement('div');
    this.racine.id = 'menu-pause';
    this.racine.hidden = true;
    this.racine.setAttribute('role', 'dialog');
    this.racine.setAttribute('aria-label', 'Pause');

    const panneau = document.createElement('div');
    panneau.className = 'pause-panneau';

    const titre = document.createElement('h2');
    titre.className = 'pause-titre';
    titre.textContent = 'Pause';

    const boutons = document.createElement('div');
    boutons.className = 'menu-boutons';

    const btnReprendre = this.creerBouton('Reprendre', () => this.callbackReprendre?.());
    const btnParams = this.creerBouton('Paramètres', () => this.callbackParametres?.());
    const btnMenu = this.creerBouton('Menu principal', () => this.callbackMenuPrincipal?.());

    boutons.append(btnReprendre, btnParams, btnMenu);
    panneau.append(titre, boutons);
    this.racine.appendChild(panneau);
    document.body.appendChild(this.racine);
  }

  ouvrir(): void {
    this.racine.hidden = false;
    requestAnimationFrame(() => {
      this.racine.querySelector<HTMLButtonElement>('button')?.focus();
    });
  }

  fermer(): void {
    this.racine.hidden = true;
  }
  get estOuvert(): boolean {
    return !this.racine.hidden;
  }

  surReprendre(cb: () => void): void {
    this.callbackReprendre = cb;
  }
  surParametres(cb: () => void): void {
    this.callbackParametres = cb;
  }
  surMenuPrincipal(cb: () => void): void {
    this.callbackMenuPrincipal = cb;
  }

  private creerBouton(libelle: string, action: () => void): HTMLButtonElement {
    const b = document.createElement('button');
    b.className = 'menu-bouton';
    b.textContent = libelle;
    b.addEventListener('click', action);
    return b;
  }
}
