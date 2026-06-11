/**
 * Types du système de dialogue (Architecture.md §5 — dialogues/).
 *
 * Un arbre de dialogue est une suite de nœuds. Chaque nœud peut :
 *   - afficher une réplique (nœud « texte ») ;
 *   - proposer des choix au joueur (nœud « choix ») ;
 *   - déclencher un effet de jeu (ajouter au journal, émettre un événement…).
 *
 * Les arbres sont définis en TypeScript (typage fort) plutôt qu'en JSON
 * externe — plus sûr, plus simple, pas de loader asynchrone.
 * Au besoin d'internationalisation, les clés de localisation remplacent
 * les chaînes directes sans changer la structure.
 */

/** Effet déclenché lors de l'affichage d'un nœud. */
export interface EffetDialogue {
  type: 'journal' | 'evenement';
  /** Id de l'entrée journal ou du canal d'événement. */
  valeur: string;
}

/** Réplique simple : un locuteur dit quelque chose, puis on passe au suivant. */
export interface NœudTexte {
  type: 'texte';
  id: string;
  locuteur: string;
  texte: string;
  suivant?: string;
  effets?: EffetDialogue[];
}

/** Le joueur choisit parmi plusieurs options, chacune menant à un nœud. */
export interface NœudChoix {
  type: 'choix';
  id: string;
  options: { libelle: string; cible: string }[];
}

/** Fin de la conversation. */
export interface NœudFin {
  type: 'fin';
  id: string;
}

export type NœudDialogue = NœudTexte | NœudChoix | NœudFin;

/** Arbre de dialogue complet : un id de personnage et une carte de nœuds. */
export interface ArbreDialogue {
  idPersonnage: string;
  nœudInitial: string;
  nœuds: Record<string, NœudDialogue>;
}
