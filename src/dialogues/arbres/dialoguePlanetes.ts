import type { ArbreDialogue } from '../TypesDialogue';

/**
 * Dialogues des six planètes visitées (chap. X–XV).
 * Reformulations originales dans le style de l'œuvre — Vision §17.
 * Chaque personnage est une critique satirique d'un travers humain.
 */

export const dialogueRoi: ArbreDialogue = {
  idPersonnage: 'roi',
  nœudInitial: 'accueil',
  nœuds: {
    accueil: {
      type: 'texte',
      id: 'accueil',
      locuteur: 'Le Roi',
      texte: 'Ah ! Un sujet ! Approche que je te voie mieux.',
      suivant: 'ordre1',
      effets: [{ type: 'journal', valeur: 'planete_roi' }],
    },
    ordre1: {
      type: 'texte',
      id: 'ordre1',
      locuteur: 'Le Roi',
      texte:
        "Je règne sur tout. Les étoiles m'obéissent. Mais je donne des ordres raisonnables — c'est la condition de toute autorité.",
      suivant: 'choix1',
    },
    choix1: {
      type: 'choix',
      id: 'choix1',
      options: [
        { libelle: 'Sur quoi régnez-vous exactement ?', cible: 'regner' },
        { libelle: 'Puis-je voir un coucher de soleil ?', cible: 'soleil' },
      ],
    },
    regner: {
      type: 'texte',
      id: 'regner',
      locuteur: 'Le Roi',
      texte:
        "Sur tout cela… dit-il d'un geste vague vers les étoiles. Un monarque universel se doit de l'être vraiment.",
      suivant: 'fin',
    },
    soleil: {
      type: 'texte',
      id: 'soleil',
      locuteur: 'Le Roi',
      texte:
        "Je t'ordonne de l'attendre. Dans ma science du gouvernement, les conditions doivent être favorables. Ce soir, vers sept heures quarante.",
      suivant: 'fin',
    },
    fin: { type: 'fin', id: 'fin' },
  },
};

export const dialogueVaniteux: ArbreDialogue = {
  idPersonnage: 'vaniteux',
  nœudInitial: 'accueil',
  nœuds: {
    accueil: {
      type: 'texte',
      id: 'accueil',
      locuteur: 'Le Vaniteux',
      texte: "Ah ! Un admirateur ! Frappe tes mains l'une contre l'autre.",
      suivant: 'admirer',
      effets: [{ type: 'journal', valeur: 'planete_vaniteux' }],
    },
    admirer: {
      type: 'texte',
      id: 'admirer',
      locuteur: 'Le Vaniteux',
      texte:
        "Est-ce que tu m'admires vraiment ? Je suis le plus beau, le mieux habillé, le plus riche de la planète.",
      suivant: 'choix1',
    },
    choix1: {
      type: 'choix',
      id: 'choix1',
      options: [
        { libelle: "Je t'admire.", cible: 'oui' },
        { libelle: 'Mais tu es seul ici…', cible: 'seul' },
      ],
    },
    oui: {
      type: 'texte',
      id: 'oui',
      locuteur: 'Le Vaniteux',
      texte: "Bien sûr que tu m'admires ! Fais-le encore. C'est tellement agréable.",
      suivant: 'fin',
    },
    seul: {
      type: 'texte',
      id: 'seul',
      locuteur: 'Le Vaniteux',
      texte: 'Fais-moi ce plaisir. Admire-moi quand même.',
      suivant: 'fin',
    },
    fin: { type: 'fin', id: 'fin' },
  },
};

export const dialogueBuveur: ArbreDialogue = {
  idPersonnage: 'buveur',
  nœudInitial: 'accueil',
  nœuds: {
    accueil: {
      type: 'texte',
      id: 'accueil',
      locuteur: 'Le Buveur',
      texte: '…',
      suivant: 'pourquoi',
      effets: [{ type: 'journal', valeur: 'planete_buveur' }],
    },
    pourquoi: {
      type: 'texte',
      id: 'pourquoi',
      locuteur: 'Le Buveur',
      texte: "Je bois pour oublier que j'ai honte de boire.",
      suivant: 'fin',
    },
    fin: { type: 'fin', id: 'fin' },
  },
};

export const dialogueBusinessman: ArbreDialogue = {
  idPersonnage: 'businessman',
  nœudInitial: 'accueil',
  nœuds: {
    accueil: {
      type: 'texte',
      id: 'accueil',
      locuteur: 'Le Businessman',
      texte:
        'Pas le temps. Cinq cent un millions six cent vingt-deux mille sept cent trente et un. Je suis sérieux, moi.',
      suivant: 'posseder',
      effets: [{ type: 'journal', valeur: 'planete_businessman' }],
    },
    posseder: {
      type: 'texte',
      id: 'posseder',
      locuteur: 'Le Businessman',
      texte:
        "Je possède les étoiles. Personne n'y avait pensé avant moi. Je les compte et les recompte. C'est sérieux.",
      suivant: 'choix1',
    },
    choix1: {
      type: 'choix',
      id: 'choix1',
      options: [
        { libelle: 'À quoi ça vous sert ?', cible: 'servir' },
        { libelle: "Moi je possède une fleur que j'arrose…", cible: 'fleur' },
      ],
    },
    servir: {
      type: 'texte',
      id: 'servir',
      locuteur: 'Le Businessman',
      texte:
        "Ça me sert à être riche. Et être riche me sert à acheter d'autres étoiles. C'est très sérieux.",
      suivant: 'fin',
    },
    fleur: {
      type: 'texte',
      id: 'fleur',
      locuteur: 'Le Businessman',
      texte: '…',
      suivant: 'fin',
    },
    fin: { type: 'fin', id: 'fin' },
  },
};

export const dialogueAllumeur: ArbreDialogue = {
  idPersonnage: 'allumeur',
  nœudInitial: 'accueil',
  nœuds: {
    accueil: {
      type: 'texte',
      id: 'accueil',
      locuteur: "L'Allumeur",
      texte: "Bonjour. C'est la consigne. Bonsoir.",
      suivant: 'consigne',
      effets: [{ type: 'journal', valeur: 'planete_allumeur' }],
    },
    consigne: {
      type: 'texte',
      id: 'consigne',
      locuteur: "L'Allumeur",
      texte:
        "La planète tourne une fois par minute. J'allume et j'éteins sans arrêt. La consigne n'a pas changé, mais la planète s'est mise à tourner plus vite.",
      suivant: 'choix1',
    },
    choix1: {
      type: 'choix',
      id: 'choix1',
      options: [
        { libelle: 'Tu pourrais marcher lentement pour te reposer…', cible: 'marcher' },
        { libelle: "C'est terrible.", cible: 'terrible' },
      ],
    },
    marcher: {
      type: 'texte',
      id: 'marcher',
      locuteur: "L'Allumeur",
      texte: "Ce n'est pas de chance. Ce que j'aime dans la vie, c'est dormir. Bonjour.",
      suivant: 'fin',
    },
    terrible: {
      type: 'texte',
      id: 'terrible',
      locuteur: "L'Allumeur",
      texte: "C'est la consigne. Bonsoir.",
      suivant: 'fin',
    },
    fin: { type: 'fin', id: 'fin' },
  },
};

export const dialogueGeographe: ArbreDialogue = {
  idPersonnage: 'geographe',
  nœudInitial: 'accueil',
  nœuds: {
    accueil: {
      type: 'texte',
      id: 'accueil',
      locuteur: 'Le Géographe',
      texte: 'Tiens, un explorateur ! Décris-moi ta planète.',
      suivant: 'ephemere',
      effets: [{ type: 'journal', valeur: 'planete_geographe' }],
    },
    ephemere: {
      type: 'texte',
      id: 'ephemere',
      locuteur: 'Le Géographe',
      texte:
        "Une fleur ? Nous ne notons pas les fleurs. Elles sont éphémères. Ce qui compte, c'est ce qui ne change pas — les montagnes, les mers.",
      suivant: 'choix1',
    },
    choix1: {
      type: 'choix',
      id: 'choix1',
      options: [
        { libelle: "Éphémère… qu'est-ce que ça veut dire ?", cible: 'definition' },
        { libelle: "Où me conseillez-vous d'aller ?", cible: 'terre' },
      ],
    },
    definition: {
      type: 'texte',
      id: 'definition',
      locuteur: 'Le Géographe',
      texte: 'Ça signifie : menacé de disparition prochaine.',
      suivant: 'terre',
    },
    terre: {
      type: 'texte',
      id: 'terre',
      locuteur: 'Le Géographe',
      texte: 'La Terre. Elle a bonne réputation.',
      suivant: 'fin',
      effets: [{ type: 'journal', valeur: 'conseil_terre' }],
    },
    fin: { type: 'fin', id: 'fin' },
  },
};
