import { LocalizationManager } from '../localization/LocalizationManager';

/**
 * Indicateur d'interaction contextuel (touche E visible quand on est proche
 * d'un personnage ou d'un objet interactif). Couche DOM discrète.
 */
export class BoutonInteraction {
  private readonly racine: HTMLDivElement;
  private libelle = '';

  constructor() {
    this.racine = document.createElement('div');
    this.racine.id = 'bouton-interaction';
    this.racine.hidden = true;
    document.body.appendChild(this.racine);
  }

  /** Affiche le bouton avec le libellé d'action (ex. « Interagir »). */
  afficher(libelle: string): void {
    if (libelle === this.libelle && !this.racine.hidden) return;
    this.libelle = libelle;
    this.racine.textContent = `[E] ${libelle}`;
    this.racine.hidden = false;
  }

  /** Masque le bouton. */
  masquer(): void {
    if (this.racine.hidden) return;
    this.racine.hidden = true;
    this.libelle = '';
  }

  liberer(): void {
    this.racine.remove();
  }
}

/** Utilitaire : libellé d'interaction selon le type d'objet. */
export function libellePourType(type: string): string {
  const ui = LocalizationManager.ui;
  const table: Record<string, string> = {
    rose: ui.interagir,
    volcan: ui.ramoner,
    baobab: ui.arracher,
    globe: ui.mettreGlobe,
    observer: ui.observer,
  };
  return table[type] ?? ui.interagir;
}
