import type { Journal } from '../game/Journal';
import { LocalizationManager } from '../localization/LocalizationManager';

/**
 * Fenêtre du journal de voyage (Architecture.md §5 — ui/, Vision §7).
 * Accessible via la touche J. Liste les pensées dans l'ordre de découverte.
 */
export class FenetreJournal {
  private readonly racine: HTMLDivElement;
  private readonly liste: HTMLDivElement;
  private ouverte = false;

  constructor(private readonly journal: Journal) {
    this.racine = document.createElement('div');
    this.racine.id = 'fenetre-journal';
    this.racine.setAttribute('role', 'dialog');
    this.racine.setAttribute('aria-label', LocalizationManager.ui.journal);
    this.racine.hidden = true;

    const entete = document.createElement('div');
    entete.className = 'journal-entete';

    const titre = document.createElement('h2');
    titre.textContent = LocalizationManager.ui.journal;

    const btnFermer = document.createElement('button');
    btnFermer.className = 'journal-fermer';
    btnFermer.textContent = LocalizationManager.ui.fermer;
    btnFermer.addEventListener('click', () => this.fermer());

    entete.append(titre, btnFermer);

    this.liste = document.createElement('div');
    this.liste.className = 'journal-liste';

    this.racine.append(entete, this.liste);
    document.body.appendChild(this.racine);

    // La touche J est gérée par le Bootstrap, pas ici.
  }

  basculer(): void {
    if (this.ouverte) {
      this.fermer();
    } else {
      this.ouvrir();
    }
  }

  get estOuvert(): boolean {
    return this.ouverte;
  }

  liberer(): void {
    this.racine.remove();
  }

  // ---------------------------------------------------------------- privé --

  private ouvrir(): void {
    this.rafraichir();
    this.racine.hidden = false;
    this.ouverte = true;
  }

  private fermer(): void {
    this.racine.hidden = true;
    this.ouverte = false;
  }

  private rafraichir(): void {
    this.liste.innerHTML = '';
    if (this.journal.entrees.length === 0) {
      const vide = document.createElement('p');
      vide.className = 'journal-vide';
      vide.textContent = `Aucune pensée notée pour l'instant.`;
      this.liste.appendChild(vide);
      return;
    }
    for (const entree of this.journal.entrees) {
      const article = document.createElement('article');
      article.className = 'journal-entree';
      const h3 = document.createElement('h3');
      h3.textContent = entree.titre;
      const p = document.createElement('p');
      p.textContent = entree.texte;
      article.append(h3, p);
      this.liste.appendChild(article);
    }
  }
}
