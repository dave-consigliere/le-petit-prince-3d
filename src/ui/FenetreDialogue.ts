import type { DialogueManager } from '../dialogues/DialogueManager';
import type { NœudTexte, NœudChoix } from '../dialogues/TypesDialogue';
import { LocalizationManager } from '../localization/LocalizationManager';

/**
 * Fenêtre de dialogue — couche DOM par-dessus le canvas (Vision §11).
 *
 * Choix de conception : HTML/CSS plutôt que Three.js pour le texte :
 *   - rendu de police natif du navigateur (lisibilité maximale) ;
 *   - accessibilité clavier gratuite (tabindex, rôles ARIA) ;
 *   - style « page de livre » cohérent avec l'identité du projet.
 *
 * La fenêtre s'abonne au DialogueManager et se met à jour automatiquement.
 */
export class FenetreDialogue {
  private readonly racine: HTMLDivElement;
  private readonly conteneurTexte: HTMLDivElement;
  private readonly conteneurChoix: HTMLDivElement;
  private readonly boutonContinuer: HTMLButtonElement;
  private desabonner: (() => void) | null = null;

  /** Temps de l'effet machine-à-écrire, en secondes par caractère. */
  private static readonly VITESSE_FRAPPE = 0.028;
  private intervalleMAE: ReturnType<typeof setInterval> | null = null;
  private texteComplet = '';
  private positionFrappe = 0;

  constructor(private readonly manager: DialogueManager) {
    this.racine = document.createElement('div');
    this.racine.id = 'fenetre-dialogue';
    this.racine.setAttribute('role', 'dialog');
    this.racine.setAttribute('aria-modal', 'false');
    this.racine.setAttribute('aria-label', 'Dialogue');
    this.racine.hidden = true;

    this.conteneurTexte = document.createElement('div');
    this.conteneurTexte.className = 'dialogue-texte';
    this.conteneurTexte.setAttribute('aria-live', 'polite');

    this.conteneurChoix = document.createElement('div');
    this.conteneurChoix.className = 'dialogue-choix';

    this.boutonContinuer = document.createElement('button');
    this.boutonContinuer.className = 'dialogue-continuer';
    this.boutonContinuer.textContent = LocalizationManager.ui.continuer;
    this.boutonContinuer.addEventListener('click', () => {
      if (this.positionFrappe < this.texteComplet.length) {
        // Premier clic : affiche tout le texte immédiatement.
        this.finirFrappe();
      } else {
        this.manager.avancer();
      }
    });

    // Avancer avec la touche Espace ou Entrée.
    this.racine.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        this.boutonContinuer.click();
      }
    });

    this.racine.append(this.conteneurTexte, this.conteneurChoix, this.boutonContinuer);
    document.body.appendChild(this.racine);

    this.desabonner = this.manager.abonner(() => this.synchroniser());
  }

  liberer(): void {
    this.desabonner?.();
    this.arreterFrappe();
    this.racine.remove();
  }

  // ---------------------------------------------------------------- privé --

  private synchroniser(): void {
    const { actif, nœudCourant } = this.manager.etat;

    if (!actif || !nœudCourant) {
      this.racine.hidden = true;
      return;
    }

    this.racine.hidden = false;
    this.conteneurChoix.innerHTML = '';

    if (nœudCourant.type === 'texte') {
      const nœud = nœudCourant as NœudTexte;
      this.boutonContinuer.hidden = false;
      this.demarrerFrappe(`${nœud.locuteur} : ${nœud.texte}`);
    } else if (nœudCourant.type === 'choix') {
      const nœud = nœudCourant as NœudChoix;
      this.boutonContinuer.hidden = true;
      this.conteneurTexte.textContent = '';
      nœud.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'dialogue-option';
        btn.textContent = option.libelle;
        btn.addEventListener('click', () => this.manager.choisir(index));
        this.conteneurChoix.appendChild(btn);
      });
    }
  }

  private demarrerFrappe(texte: string): void {
    this.arreterFrappe();
    this.texteComplet = texte;
    this.positionFrappe = 0;
    this.conteneurTexte.textContent = '';

    const delai = Math.round(FenetreDialogue.VITESSE_FRAPPE * 1000);
    this.intervalleMAE = setInterval(() => {
      this.positionFrappe++;
      this.conteneurTexte.textContent = this.texteComplet.slice(0, this.positionFrappe);
      if (this.positionFrappe >= this.texteComplet.length) this.arreterFrappe();
    }, delai);
  }

  private finirFrappe(): void {
    this.arreterFrappe();
    this.positionFrappe = this.texteComplet.length;
    this.conteneurTexte.textContent = this.texteComplet;
  }

  private arreterFrappe(): void {
    if (this.intervalleMAE !== null) {
      clearInterval(this.intervalleMAE);
      this.intervalleMAE = null;
    }
  }
}
