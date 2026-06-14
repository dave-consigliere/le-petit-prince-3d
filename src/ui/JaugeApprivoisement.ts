import type { SystemeApprivoisement } from '../game/Apprivoisement';
import { LocalizationManager } from '../localization/LocalizationManager';

/**
 * Jauge visuelle de progression de l'apprivoisement.
 * Apparaît uniquement quand le joueur est dans la zone du renard.
 * Discrète, en bas à droite — ne brise pas l'immersion contemplative.
 */
export class JaugeApprivoisement {
  private readonly racine: HTMLDivElement;
  private readonly etiquette: HTMLDivElement;
  private readonly barre: HTMLDivElement;
  private readonly remplissage: HTMLDivElement;

  private static readonly LIBELLES: Record<string, string> = {
    etranger: 'Le renard te regarde',
    curieux: 'Curieux',
    attentif: 'Attentif',
    familier: 'Familier',
    ami: 'Ami',
  };

  constructor(private readonly systeme: SystemeApprivoisement) {
    this.racine = document.createElement('div');
    this.racine.id = 'jauge-apprivoisement';
    this.racine.hidden = true;

    this.etiquette = document.createElement('div');
    this.etiquette.className = 'jauge-etiquette';

    this.barre = document.createElement('div');
    this.barre.className = 'jauge-barre';
    this.remplissage = document.createElement('div');
    this.remplissage.className = 'jauge-remplissage';
    this.barre.appendChild(this.remplissage);

    this.racine.append(this.etiquette, this.barre);
    document.body.appendChild(this.racine);
  }

  /** Affiche la jauge avec l'état courant. */
  afficher(): void {
    if (this.racine.hidden) this.racine.hidden = false;
    const s = this.systeme.suivi;
    const libelle = JaugeApprivoisement.LIBELLES[s.etat] ?? s.etat;
    this.etiquette.textContent = libelle;
    this.remplissage.style.width = `${Math.round(s.progressionPalier * 100)}%`;
  }

  masquer(): void {
    if (!this.racine.hidden) this.racine.hidden = true;
  }

  /** Garde la trace que l'utilisateur n'utilise pas le système. */
  _accederTextes(): typeof LocalizationManager.journal {
    return LocalizationManager.journal;
  }

  liberer(): void {
    this.racine.remove();
  }
}
