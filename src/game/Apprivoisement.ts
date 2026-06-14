import type { EventBus } from '../engine/EventBus';
import type { EvenementsJeu } from './Evenements';
import { Logger } from '../utilities/Logger';

/**
 * Système d'apprivoisement du Renard (chap. XXI) — mécanique centrale de M5.
 *
 * Principe canonique : « Tu t'assoiras d'abord un peu loin de moi. Je te
 * regarderai du coin de l'œil et tu ne diras rien. Le langage est source
 * de malentendus. Mais, chaque jour, tu pourras t'asseoir un peu plus près. »
 *
 * Implémentation :
 *   - cinq niveaux d'apprivoisement (0 = étranger, 4 = ami) ;
 *   - chaque niveau exige : s'approcher à une distance précise, attendre
 *     immobile quelques secondes, sans courir ;
 *   - franchir un niveau débloque une réplique du Renard et une entrée
 *     de journal ; le renard tolère ensuite qu'on s'approche un peu plus.
 *
 * Cette mécanique est rendue accessible via une méthode unique
 * mettreAJour() appelée par la scène Terre.
 */

export type EtatApprivoisement = 'etranger' | 'curieux' | 'attentif' | 'familier' | 'ami';

/** Configuration de chaque palier. */
interface PalierApprivoisement {
  etat: EtatApprivoisement;
  /** Distance maximale (en mètres) à laquelle le palier se valide. */
  distanceMax: number;
  /** Temps d'immobilité requis (en secondes) au sein de la distance. */
  tempsRequis: number;
  /** Id de l'entrée de journal débloquée à ce palier. */
  idEntreeJournal: string;
}

const PALIERS: readonly PalierApprivoisement[] = [
  { etat: 'curieux', distanceMax: 8.0, tempsRequis: 2.5, idEntreeJournal: 'terre_renard_curieux' },
  {
    etat: 'attentif',
    distanceMax: 5.5,
    tempsRequis: 3.0,
    idEntreeJournal: 'terre_renard_attentif',
  },
  {
    etat: 'familier',
    distanceMax: 3.5,
    tempsRequis: 4.0,
    idEntreeJournal: 'terre_renard_familier',
  },
  { etat: 'ami', distanceMax: 2.0, tempsRequis: 5.0, idEntreeJournal: 'terre_renard_ami' },
];

/** État courant du système. */
export interface SuiviApprivoisement {
  etat: EtatApprivoisement;
  niveau: number; // 0 à 4
  /** Temps d'immobilité accumulé dans la zone du palier suivant. */
  tempsImmobile: number;
  /** Progression normalisée du palier courant [0 ; 1]. */
  progressionPalier: number;
}

export class SystemeApprivoisement {
  readonly suivi: SuiviApprivoisement = {
    etat: 'etranger',
    niveau: 0,
    tempsImmobile: 0,
    progressionPalier: 0,
  };

  /** True quand le palier « ami » a été atteint (déclenche le secret). */
  apprivoiseComplet = false;

  constructor(private readonly evenements: EventBus<EvenementsJeu>) {}

  /**
   * @param distance distance joueur ↔ renard, en mètres ;
   * @param immobile true si le joueur est immobile (pas de marche/course) ;
   * @param dt temps écoulé depuis la dernière image.
   * @returns true si un nouveau palier vient d'être franchi.
   */
  mettreAJour(distance: number, immobile: boolean, dt: number): boolean {
    if (this.apprivoiseComplet) return false;

    const palier = PALIERS[this.suivi.niveau];
    if (!palier) return false;

    // Si le joueur s'est éloigné, la progression du palier régresse doucement
    if (distance > palier.distanceMax) {
      this.suivi.tempsImmobile = Math.max(0, this.suivi.tempsImmobile - dt * 0.5);
      this.suivi.progressionPalier = this.suivi.tempsImmobile / palier.tempsRequis;
      return false;
    }

    // Le joueur est dans la zone : s'il est immobile, il accumule du temps
    if (immobile) {
      this.suivi.tempsImmobile += dt;
    } else {
      // Le mouvement effraie le renard : recul léger
      this.suivi.tempsImmobile = Math.max(0, this.suivi.tempsImmobile - dt * 0.3);
    }

    this.suivi.progressionPalier = Math.min(1, this.suivi.tempsImmobile / palier.tempsRequis);

    if (this.suivi.tempsImmobile >= palier.tempsRequis) {
      this.franchirPalier(palier);
      return true;
    }
    return false;
  }

  /** Pour la sauvegarde / les tests. */
  forcerNiveau(niveau: number): void {
    this.suivi.niveau = Math.max(0, Math.min(PALIERS.length, niveau));
    const palierAtteint = niveau > 0 ? PALIERS[niveau - 1] : null;
    this.suivi.etat = palierAtteint?.etat ?? 'etranger';
    this.apprivoiseComplet = niveau >= PALIERS.length;
    this.suivi.tempsImmobile = 0;
    this.suivi.progressionPalier = 0;
  }

  // ---------------------------------------------------------------- privé --

  private franchirPalier(palier: PalierApprivoisement): void {
    this.suivi.niveau++;
    this.suivi.etat = palier.etat;
    this.suivi.tempsImmobile = 0;
    this.suivi.progressionPalier = 0;
    Logger.info(`Apprivoisement : « ${palier.etat} ».`);
    this.evenements.emettre('apprivoisement:palier', {
      etat: palier.etat,
      idEntreeJournal: palier.idEntreeJournal,
    });
    if (this.suivi.niveau >= PALIERS.length) {
      this.apprivoiseComplet = true;
    }
  }
}
