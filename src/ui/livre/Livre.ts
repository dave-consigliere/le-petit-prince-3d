import { CHAPITRES, type ChapitreLivre } from '../../livre/Chapitres';
import type { ProgressionService } from '../../game/progression/ProgressionService';

/**
 * Composant Livre — page-par-page avec flèches gauche/droite.
 *
 * Trois zones :
 *   1. Sommaire (à gauche) — liste cliquable des 27 chapitres + dédicace,
 *      avec indicateur « ✓ Vous avez vécu ce chapitre » pour ceux liés
 *      à un objectif de progression rempli.
 *   2. Page courante (centre) — titre, extrait littéral encadré, paraphrase.
 *   3. Navigation (bas) — flèches gauche/droite, indicateur de page.
 *
 * Marque-page automatique : restaure le dernier chapitre lu via localStorage.
 */

const CLE_MARQUE_PAGE = 'lpp3d_livre_page';

export class Livre {
  private readonly racine: HTMLDivElement;
  private readonly sommaire: HTMLElement;
  private readonly pageCourante: HTMLElement;
  private readonly btnPrec: HTMLButtonElement;
  private readonly btnSuiv: HTMLButtonElement;
  private readonly indicateurPage: HTMLDivElement;

  private indexCourant = 0;
  private surFermer: (() => void) | null = null;

  constructor(private readonly progression: ProgressionService) {
    this.racine = document.createElement('div');
    this.racine.id = 'livre';
    this.racine.hidden = true;
    this.racine.setAttribute('role', 'dialog');
    this.racine.setAttribute('aria-label', 'Le Petit Prince — Livre intégral');

    // -- En-tête --
    const entete = document.createElement('div');
    entete.className = 'livre-entete';
    const titre = document.createElement('h2');
    titre.textContent = 'Le Petit Prince';
    const soustitre = document.createElement('span');
    soustitre.className = 'livre-soustitre';
    soustitre.textContent = "d'Antoine de Saint-Exupéry";
    const btnFermer = document.createElement('button');
    btnFermer.className = 'livre-fermer';
    btnFermer.setAttribute('aria-label', 'Fermer le livre');
    btnFermer.textContent = 'Fermer';
    btnFermer.addEventListener('click', () => this.fermer());
    const enteteGauche = document.createElement('div');
    enteteGauche.append(titre, soustitre);
    entete.append(enteteGauche, btnFermer);

    // -- Corps : sommaire + page --
    const corps = document.createElement('div');
    corps.className = 'livre-corps';

    this.sommaire = document.createElement('nav');
    this.sommaire.className = 'livre-sommaire';
    this.sommaire.setAttribute('aria-label', 'Sommaire');

    this.pageCourante = document.createElement('article');
    this.pageCourante.className = 'livre-page';

    corps.append(this.sommaire, this.pageCourante);

    // -- Navigation page-par-page --
    const navigation = document.createElement('div');
    navigation.className = 'livre-navigation';

    this.btnPrec = document.createElement('button');
    this.btnPrec.className = 'livre-nav-bouton';
    this.btnPrec.setAttribute('aria-label', 'Page précédente');
    this.btnPrec.innerHTML = '&larr; Précédent';
    this.btnPrec.addEventListener('click', () => this.allerA(this.indexCourant - 1));

    this.indicateurPage = document.createElement('div');
    this.indicateurPage.className = 'livre-indicateur-page';

    this.btnSuiv = document.createElement('button');
    this.btnSuiv.className = 'livre-nav-bouton';
    this.btnSuiv.setAttribute('aria-label', 'Page suivante');
    this.btnSuiv.innerHTML = 'Suivant &rarr;';
    this.btnSuiv.addEventListener('click', () => this.allerA(this.indexCourant + 1));

    navigation.append(this.btnPrec, this.indicateurPage, this.btnSuiv);

    this.racine.append(entete, corps, navigation);
    document.body.appendChild(this.racine);

    // Navigation clavier : flèches gauche/droite
    this.racine.addEventListener('keydown', (e) => {
      if (this.racine.hidden) return;
      if (e.code === 'ArrowLeft') this.allerA(this.indexCourant - 1);
      else if (e.code === 'ArrowRight') this.allerA(this.indexCourant + 1);
      else if (e.code === 'Escape') this.fermer();
    });
  }

  ouvrir(surFermer?: () => void): void {
    this.surFermer = surFermer ?? null;
    this.construireSommaire();
    // Restaurer le marque-page
    const sauve = parseInt(localStorage.getItem(CLE_MARQUE_PAGE) ?? '0', 10);
    this.indexCourant = isNaN(sauve) ? 0 : Math.min(sauve, CHAPITRES.length - 1);
    this.afficherPage();
    this.racine.hidden = false;
    requestAnimationFrame(() => this.racine.focus());
  }

  fermer(): void {
    this.racine.hidden = true;
    this.surFermer?.();
  }

  // ---------------------------------------------------------------- privé

  private construireSommaire(): void {
    this.sommaire.innerHTML = '';
    const titreSomm = document.createElement('h3');
    titreSomm.textContent = 'Chapitres';
    this.sommaire.appendChild(titreSomm);

    const liste = document.createElement('ol');
    liste.className = 'livre-sommaire-liste';

    CHAPITRES.forEach((ch, idx) => {
      const item = document.createElement('li');
      const bouton = document.createElement('button');
      bouton.className = 'livre-sommaire-item';
      if (idx === this.indexCourant) bouton.classList.add('actif');

      const num = document.createElement('span');
      num.className = 'livre-sommaire-num';
      num.textContent = ch.numero === 'dedicace' ? '✦' : String(ch.numero);

      const titre = document.createElement('span');
      titre.className = 'livre-sommaire-titre';
      titre.textContent = ch.titre;

      // Indicateur "vécu" si l'objectif associé est rempli
      const vecu = this.aEteVecu(ch);
      if (vecu) {
        const marque = document.createElement('span');
        marque.className = 'livre-sommaire-marque';
        marque.title = 'Vous avez vécu ce chapitre dans le jeu';
        marque.textContent = '✓';
        bouton.appendChild(marque);
      }

      bouton.append(num, titre);
      bouton.addEventListener('click', () => this.allerA(idx));
      item.appendChild(bouton);
      liste.appendChild(item);
    });

    this.sommaire.appendChild(liste);
  }

  private allerA(index: number): void {
    if (index < 0 || index >= CHAPITRES.length) return;
    this.indexCourant = index;
    localStorage.setItem(CLE_MARQUE_PAGE, String(index));
    this.afficherPage();
    this.mettreAJourSommaire();
  }

  private afficherPage(): void {
    const ch = CHAPITRES[this.indexCourant];
    if (!ch) return;

    this.pageCourante.innerHTML = '';

    // Numéro de chapitre
    const numero = document.createElement('div');
    numero.className = 'livre-page-numero';
    numero.textContent =
      ch.numero === 'dedicace' ? 'Dédicace' : `Chapitre ${this.romain(ch.numero)}`;

    // Titre du chapitre
    const titre = document.createElement('h1');
    titre.className = 'livre-page-titre';
    titre.textContent = ch.titre;

    // Extrait littéral (encadré)
    const extrait = document.createElement('blockquote');
    extrait.className = 'livre-page-extrait';
    extrait.textContent = ch.extrait;

    // Paraphrase (le « résumé » en bas)
    const paraphrase = document.createElement('p');
    paraphrase.className = 'livre-page-paraphrase';
    paraphrase.textContent = ch.paraphrase;

    // Note sur les droits (seulement sur le premier et le dernier)
    this.pageCourante.append(numero, titre, extrait, paraphrase);

    if (this.indexCourant === 0) {
      const note = document.createElement('aside');
      note.className = 'livre-note';
      note.innerHTML =
        `<em>Cette édition propose des extraits courts du texte original ` +
        `et des résumés rédigés dans l'esprit de l'œuvre. ` +
        `Pour découvrir le livre dans son intégralité, recherchez l'édition Gallimard.</em>`;
      this.pageCourante.appendChild(note);
    }

    // Indicateur de page
    const total = CHAPITRES.length;
    this.indicateurPage.textContent = `${this.indexCourant + 1} / ${total}`;
    this.btnPrec.disabled = this.indexCourant === 0;
    this.btnSuiv.disabled = this.indexCourant >= total - 1;
  }

  private mettreAJourSommaire(): void {
    const items = this.sommaire.querySelectorAll('.livre-sommaire-item');
    items.forEach((b, idx) => b.classList.toggle('actif', idx === this.indexCourant));
  }

  private aEteVecu(ch: ChapitreLivre): boolean {
    if (!ch.objectifAssocie) return false;
    // On considère un chapitre « vécu » si son objectif est rempli OU si
    // sa scène associée a été visitée (souvenir débloqué).
    return (
      (ch.sceneAssociee !== undefined && this.progression.estDebloque(ch.sceneAssociee)) || false
    );
  }

  private romain(n: number): string {
    const valeurs: [number, string][] = [
      [10, 'X'],
      [9, 'IX'],
      [5, 'V'],
      [4, 'IV'],
      [1, 'I'],
    ];
    let s = '';
    let r = n;
    for (const [v, sym] of valeurs) {
      while (r >= v) {
        s += sym;
        r -= v;
      }
    }
    return s;
  }
}
