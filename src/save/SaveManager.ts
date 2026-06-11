import type { ProgressionService } from '../game/progression/ProgressionService';
import type { Journal } from '../game/Journal';
import { Logger } from '../utilities/Logger';

/**
 * Gestionnaire de sauvegarde (Architecture.md §12).
 *
 * Stockage : localStorage (hors-ligne, sans serveur).
 * Format : JSON versionné — la version permet de détecter une sauvegarde
 * incompatible et de l'ignorer proprement plutôt que de planter.
 *
 * Données sauvegardées :
 *   - progression narrative (jour, objectifs, souvenirs débloqués) ;
 *   - entrées du journal de voyage ;
 *   - paramètres utilisateur (volumes).
 */

const CLE_SAUVEGARDE = 'lpp3d_v2'; // v2 = M3 (invalide les sauvegardes M2)
const VERSION_SCHEMA = 1;

interface DonneesSauvegarde {
  version: number;
  horodatage: number;
  progression: ReturnType<ProgressionService['serialiser']>;
  journal: { id: string; titre: string; texte: string }[];
  parametres: { volumeMusique: number; volumeAmbiance: number; muet: boolean };
}

export class SaveManager {
  constructor(
    private readonly progression: ProgressionService,
    private readonly journal: Journal,
  ) {}

  /** Sauvegarde l'état complet. */
  sauvegarder(parametres: { volumeMusique: number; volumeAmbiance: number; muet: boolean }): void {
    const donnees: DonneesSauvegarde = {
      version: VERSION_SCHEMA,
      horodatage: Date.now(),
      progression: this.progression.serialiser(),
      journal: this.journal.entrees.map((e) => ({
        id: e.id,
        titre: e.titre,
        texte: e.texte,
      })),
      parametres,
    };
    try {
      localStorage.setItem(CLE_SAUVEGARDE, JSON.stringify(donnees));
      Logger.info('Partie sauvegardée.');
    } catch (erreur) {
      Logger.erreur('Échec de la sauvegarde.', erreur);
    }
  }

  /**
   * Charge la sauvegarde si elle existe et est compatible.
   * @returns les paramètres restaurés, ou null si aucune sauvegarde valide.
   */
  charger(): DonneesSauvegarde['parametres'] | null {
    try {
      const brut = localStorage.getItem(CLE_SAUVEGARDE);
      if (!brut) return null;

      const donnees = JSON.parse(brut) as DonneesSauvegarde;
      if (donnees.version !== VERSION_SCHEMA) {
        Logger.avertissement(
          `Sauvegarde version ${donnees.version} ignorée (attendu : ${VERSION_SCHEMA}).`,
        );
        return null;
      }

      this.progression.restaurer(donnees.progression);
      for (const entree of donnees.journal) {
        this.journal.ajouter(entree);
      }
      Logger.info(`Partie chargée (${new Date(donnees.horodatage).toLocaleString()}).`);
      return donnees.parametres;
    } catch (erreur) {
      Logger.erreur('Échec du chargement.', erreur);
      return null;
    }
  }

  /** Supprime la sauvegarde (recommencer). */
  effacer(): void {
    localStorage.removeItem(CLE_SAUVEGARDE);
    Logger.info('Sauvegarde effacée.');
  }

  /** True si une sauvegarde existe. */
  existeSauvegarde(): boolean {
    return localStorage.getItem(CLE_SAUVEGARDE) !== null;
  }
}
