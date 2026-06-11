import type { ArbreDialogue } from '../TypesDialogue';

/**
 * Dialogues de l'Aviateur (hub Désert).
 * Le ton est celui du narrateur du livre : chaleureux, légèrement mélancolique,
 * parfois pressé par les circonstances (moteur, soif).
 * Reformulations originales dans le style de l'œuvre — Vision §17.
 */

/** Jour 1 — première rencontre. */
export const dialogueAviateur_Jour1: ArbreDialogue = {
  idPersonnage: 'aviateur',
  nœudInitial: 'accueil',
  nœuds: {
    accueil: {
      type: 'texte',
      id: 'accueil',
      locuteur: "L'Aviateur",
      texte:
        "C'est toi qui m'as réveillé ce matin-là, dans ce désert. Tu m'as demandé de dessiner un mouton…",
      suivant: 'mouton',
      effets: [{ type: 'journal', valeur: 'desert_rencontre' }],
    },
    mouton: {
      type: 'texte',
      id: 'mouton',
      locuteur: "L'Aviateur",
      texte:
        "Je n'avais jamais vu quelqu'un arriver ainsi, sans explication. Comme s'il tombait du ciel.",
      suivant: 'choix1',
    },
    choix1: {
      type: 'choix',
      id: 'choix1',
      options: [
        { libelle: 'Et le mouton, tu le lui as dessiné ?', cible: 'oui_mouton' },
        { libelle: `Il venait d'où, ce petit bonhomme ?`, cible: 'origine' },
      ],
    },
    oui_mouton: {
      type: 'texte',
      id: 'oui_mouton',
      locuteur: "L'Aviateur",
      texte:
        "J'ai essayé. Trois fois. Il refusait chaque dessin. Alors j'ai dessiné une caisse, et j'ai dit : le mouton est dedans.",
      suivant: 'caisse',
    },
    caisse: {
      type: 'texte',
      id: 'caisse',
      locuteur: "L'Aviateur",
      texte: "Il a souri. C'est tout à fait comme ça qu'il le voulait, a-t-il dit.",
      suivant: 'panne',
      effets: [{ type: 'journal', valeur: 'desert_mouton' }],
    },
    origine: {
      type: 'texte',
      id: 'origine',
      locuteur: "L'Aviateur",
      texte:
        "D'une toute petite planète. À peine plus grande qu'une maison. Je crois que c'était l'astéroïde B-612.",
      suivant: 'panne',
      effets: [{ type: 'journal', valeur: 'desert_origine' }],
    },
    panne: {
      type: 'texte',
      id: 'panne',
      locuteur: "L'Aviateur",
      texte:
        "Mais pardonne-moi — mon moteur ne se réparera pas tout seul. Et l'eau commence à manquer.",
      suivant: 'fin_j1',
    },
    fin_j1: { type: 'fin', id: 'fin_j1' },
  },
};

/** Jour 3 — les baobabs. */
export const dialogueAviateur_Jour3: ArbreDialogue = {
  idPersonnage: 'aviateur',
  nœudInitial: 'baobabs',
  nœuds: {
    baobabs: {
      type: 'texte',
      id: 'baobabs',
      locuteur: "L'Aviateur",
      texte:
        "Il m'a tout expliqué sur les baobabs. Si on ne les arrache pas jeunes, ils font éclater la planète.",
      suivant: 'discipline',
      effets: [{ type: 'journal', valeur: 'desert_baobabs' }],
    },
    discipline: {
      type: 'texte',
      id: 'discipline',
      locuteur: "L'Aviateur",
      texte:
        "C'est une question de discipline, disait-il. Et pour lui, B-612 était parfaitement disciplinée.",
      suivant: 'fin_j3',
    },
    fin_j3: { type: 'fin', id: 'fin_j3' },
  },
};

/** Jour 8 — départ. */
export const dialogueAviateur_Jour8: ArbreDialogue = {
  idPersonnage: 'aviateur',
  nœudInitial: 'puits',
  nœuds: {
    puits: {
      type: 'texte',
      id: 'puits',
      locuteur: "L'Aviateur",
      texte:
        "Ce puits, nous l'avons trouvé au lever du jour. L'eau était bonne — bonne pour le cœur, comme il disait.",
      suivant: 'depart',
      effets: [{ type: 'journal', valeur: 'desert_puits' }],
    },
    depart: {
      type: 'texte',
      id: 'depart',
      locuteur: "L'Aviateur",
      texte:
        "Ce soir-là, il est reparti. Vers son étoile. Je n'ai pas retrouvé son corps au matin. Ce n'était pas un corps très lourd…",
      suivant: 'etoiles',
    },
    etoiles: {
      type: 'texte',
      id: 'etoiles',
      locuteur: "L'Aviateur",
      texte:
        "Maintenant, quand je regarde le ciel la nuit, j'écoute. Cinq cents millions de grelots…",
      suivant: 'fin_j8',
    },
    fin_j8: { type: 'fin', id: 'fin_j8' },
  },
};
