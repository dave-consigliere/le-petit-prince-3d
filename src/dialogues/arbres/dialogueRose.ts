import type { ArbreDialogue } from '../TypesDialogue';

/**
 * Arbre de dialogue de la Rose (première rencontre sur B-612).
 * Reformulations originales dans le style de l'œuvre — Vision §17.
 */
export const dialogueRose: ArbreDialogue = {
  idPersonnage: 'rose',
  nœudInitial: 'accueil',
  nœuds: {
    accueil: {
      type: 'texte',
      id: 'accueil',
      locuteur: 'La Rose',
      texte: "Ah, te voilà. J'espère que tu n'as pas oublié d'arroser avant de partir explorer.",
      suivant: 'choix1',
      effets: [{ type: 'journal', valeur: 'b612_rose' }],
    },
    choix1: {
      type: 'choix',
      id: 'choix1',
      options: [
        { libelle: 'Bien sûr. Comment vas-tu ?', cible: 'bien' },
        { libelle: 'Les baobabs encore…', cible: 'baobabs' },
        { libelle: 'Tes épines te protègent-elles vraiment ?', cible: 'epines' },
      ],
    },
    bien: {
      type: 'texte',
      id: 'bien',
      locuteur: 'La Rose',
      texte: 'Bien. Mieux, maintenant que tu es là. Mais ne le répète à personne.',
      suivant: 'globe',
    },
    baobabs: {
      type: 'texte',
      id: 'baobabs',
      locuteur: 'La Rose',
      texte:
        "Les baobabs ? Tu en as arraché trois ce matin. C'est tout à fait suffisant pour aujourd'hui.",
      suivant: 'globe',
    },
    epines: {
      type: 'texte',
      id: 'epines',
      locuteur: 'La Rose',
      texte: "Mes épines sont mes griffes. Je ne suis pas aussi fragile qu'il n'y paraît.",
      suivant: 'globe',
    },
    globe: {
      type: 'texte',
      id: 'globe',
      locuteur: 'La Rose',
      texte: "Le globe de verre, s'il te plaît. Il fait frisquet ce soir.",
      suivant: 'fin_rose',
    },
    fin_rose: { type: 'fin', id: 'fin_rose' },
  },
};
