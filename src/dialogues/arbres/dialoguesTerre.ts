import type { ArbreDialogue } from '../TypesDialogue';

/**
 * Dialogues des personnages rencontrés sur Terre (chap. XVII–XXVII).
 * Reformulations originales dans le style de l'œuvre — Vision §17.
 */

/** Le Serpent (chap. XVII) — première rencontre. */
export const dialogueSerpent: ArbreDialogue = {
  idPersonnage: 'serpent',
  nœudInitial: 'accueil',
  nœuds: {
    accueil: {
      type: 'texte',
      id: 'accueil',
      locuteur: 'Le Serpent',
      texte: 'Bonne nuit. Sur la Terre, en Afrique. Le désert.',
      suivant: 'choix1',
      effets: [{ type: 'journal', valeur: 'terre_serpent' }],
    },
    choix1: {
      type: 'choix',
      id: 'choix1',
      options: [
        { libelle: 'Où sont les hommes ?', cible: 'hommes' },
        { libelle: 'Tu es une drôle de bête.', cible: 'puissant' },
      ],
    },
    hommes: {
      type: 'texte',
      id: 'hommes',
      locuteur: 'Le Serpent',
      texte: 'On est seul aussi chez les hommes.',
      suivant: 'enigme',
    },
    puissant: {
      type: 'texte',
      id: 'puissant',
      locuteur: 'Le Serpent',
      texte: `Mince comme un doigt, oui. Mais plus puissant qu'un doigt de roi. Je puis t'emporter plus loin qu'un navire.`,
      suivant: 'enigme',
    },
    enigme: {
      type: 'texte',
      id: 'enigme',
      locuteur: 'Le Serpent',
      texte: `Celui que je touche, je le rends à la terre dont il est sorti. Mais toi, tu es pur, et tu viens d'une étoile.`,
      suivant: 'aide',
    },
    aide: {
      type: 'texte',
      id: 'aide',
      locuteur: 'Le Serpent',
      texte: `Je puis t'aider un jour, si tu regrettes trop ta planète. Je puis…`,
      suivant: 'fin',
    },
    fin: { type: 'fin', id: 'fin' },
  },
};

/**
 * Le Renard — réplique d'accueil (avant tout apprivoisement).
 * Les autres répliques arrivent au fil des paliers, via le système
 * d'apprivoisement (entrées de journal directes, pas de dialogue).
 */
export const dialogueRenard: ArbreDialogue = {
  idPersonnage: 'renard',
  nœudInitial: 'accueil',
  nœuds: {
    accueil: {
      type: 'texte',
      id: 'accueil',
      locuteur: 'Le Renard',
      texte: 'Je suis là, sous le pommier.',
      suivant: 'apprivoiser',
    },
    apprivoiser: {
      type: 'texte',
      id: 'apprivoiser',
      locuteur: 'Le Renard',
      texte: `Je ne puis pas jouer avec toi. Je ne suis pas apprivoisé.`,
      suivant: 'choix1',
    },
    choix1: {
      type: 'choix',
      id: 'choix1',
      options: [
        { libelle: `Qu'est-ce que signifie « apprivoiser » ?`, cible: 'definition' },
        { libelle: `Comment fait-on ?`, cible: 'methode' },
      ],
    },
    definition: {
      type: 'texte',
      id: 'definition',
      locuteur: 'Le Renard',
      texte: `C'est une chose trop oubliée. Ça veut dire : créer des liens. Si tu m'apprivoises, nous aurons besoin l'un de l'autre. Tu seras pour moi unique au monde.`,
      suivant: 'methode',
    },
    methode: {
      type: 'texte',
      id: 'methode',
      locuteur: 'Le Renard',
      texte: `Il faut être très patient. Tu t'assoiras d'abord un peu loin de moi. Et, chaque jour, tu pourras t'asseoir un peu plus près.`,
      suivant: 'fin',
    },
    fin: { type: 'fin', id: 'fin' },
  },
};

/** Renard — dialogue final, après apprivoisement complet (le secret). */
export const dialogueRenardSecret: ArbreDialogue = {
  idPersonnage: 'renard',
  nœudInitial: 'adieu',
  nœuds: {
    adieu: {
      type: 'texte',
      id: 'adieu',
      locuteur: 'Le Renard',
      texte: `Adieu. Voici mon secret. Il est très simple.`,
      suivant: 'secret',
    },
    secret: {
      type: 'texte',
      id: 'secret',
      locuteur: 'Le Renard',
      texte: `On ne voit bien qu'avec le cœur. L'essentiel est invisible pour les yeux.`,
      suivant: 'temps',
      effets: [{ type: 'journal', valeur: 'terre_renard_ami' }],
    },
    temps: {
      type: 'texte',
      id: 'temps',
      locuteur: 'Le Renard',
      texte: `C'est le temps que tu as perdu pour ta rose qui fait ta rose si importante.`,
      suivant: 'responsabilite',
    },
    responsabilite: {
      type: 'texte',
      id: 'responsabilite',
      locuteur: 'Le Renard',
      texte: `Tu deviens responsable pour toujours de ce que tu as apprivoisé. Tu es responsable de ta rose.`,
      suivant: 'fin',
    },
    fin: { type: 'fin', id: 'fin' },
  },
};
