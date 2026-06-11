import { FR } from './fr';
import { Logger } from '../utilities/Logger';

/**
 * Gestionnaire de localisation (Architecture.md §5 — localization/).
 * Langue principale : français. Extensible pour d'autres langues (Vision §12).
 * Utilise l'objet FR comme source de vérité typée : toute clé manquante
 * est détectée à la compilation.
 */
export class LocalizationManager {
  private static readonly catalogue = FR;

  /** Textes des personnages. */
  static get personnages() {
    return LocalizationManager.catalogue.personnages;
  }

  /** Textes du journal. */
  static get journal() {
    return LocalizationManager.catalogue.journal;
  }

  /** Libellés de l'interface. */
  static get ui() {
    return LocalizationManager.catalogue.ui;
  }

  /** Noms et descriptions des lieux. */
  static get lieux() {
    return LocalizationManager.catalogue.lieux;
  }

  /** Résout un chemin pointé (ex. « personnages.rose.lignes.bienvenue »). */
  static resoudre(chemin: string): string {
    const parties = chemin.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let nœud: any = LocalizationManager.catalogue;
    for (const partie of parties) {
      if (typeof nœud !== 'object' || !(partie in nœud)) {
        Logger.avertissement(`Clé de localisation introuvable : "${chemin}"`);
        return chemin;
      }
      nœud = nœud[partie];
    }
    return typeof nœud === 'string' ? nœud : chemin;
  }
}
