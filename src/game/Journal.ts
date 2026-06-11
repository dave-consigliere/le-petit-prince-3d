import type { EventBus } from '../engine/EventBus';
import type { EvenementsJeu } from './Evenements';

/** Une pensée notée par le joueur au fil du voyage. */
export interface EntreeJournal {
  /** Identifiant unique : empêche les doublons. */
  id: string;
  titre: string;
  texte: string;
}

/**
 * Journal de voyage (Vision_du_projet.md §7).
 *
 * Le journal recueille les pensées du Petit Prince, débloquées par les
 * observations et les interactions. C'est la traduction ludique du thème
 * « on ne voit bien qu'avec le cœur » : s'arrêter et regarder est récompensé
 * par une réflexion, jamais par des points.
 */
export class Journal {
  private readonly entreesInternes: EntreeJournal[] = [];
  private readonly identifiants = new Set<string>();

  constructor(private readonly evenements: EventBus<EvenementsJeu>) {}

  /** Liste des entrées, dans l'ordre de découverte (lecture seule). */
  get entrees(): readonly EntreeJournal[] {
    return this.entreesInternes;
  }

  /** Indique si une pensée a déjà été notée. */
  contient(id: string): boolean {
    return this.identifiants.has(id);
  }

  /**
   * Note une pensée. Sans effet si elle existe déjà.
   * @returns true si l'entrée vient d'être ajoutée.
   */
  ajouter(entree: EntreeJournal): boolean {
    if (this.identifiants.has(entree.id)) return false;
    this.identifiants.add(entree.id);
    this.entreesInternes.push(entree);
    this.evenements.emettre('journal:entree', { id: entree.id, titre: entree.titre });
    return true;
  }
}
