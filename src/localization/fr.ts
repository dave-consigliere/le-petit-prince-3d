/**
 * Textes français du jeu (langue principale, Vision §17).
 * Tous les dialogues sont des reformulations originales dans le style
 * de Saint-Exupéry — aucune citation longue du texte original.
 *
 * Structure :
 *   personnages  → textes liés à un personnage spécifique
 *   journal      → pensées notées au fil du voyage
 *   ui           → libellés de l'interface
 *   lieux        → noms et descriptions des lieux
 */
export const FR = {
  personnages: {
    rose: {
      nom: 'La Rose',
      lignes: {
        bienvenue: "Ah, te voilà de retour… J'espère que tu as pensé à moi, là-bas.",
        globe: `Le globe de verre, s'il te plaît. Il fait frisquet ce soir.`,
        baobabs: `Tu as arraché les baobabs ? Bien. Je n'aime pas les voisins encombrants.`,
        adieu: "Va. Et tâche d'être heureux. C'est tout ce que je te demande.",
        epines: "Mes épines ? Ce sont mes griffes. Je suis moins fragile qu'il n'y paraît.",
      },
    },
    aviateur: {
      nom: "L'Aviateur",
      lignes: {
        accueil:
          "C'est toi qui m'as réveillé ce matin-là, dans le désert. Dessine-moi un mouton, tu disais…",
        mouton: "Je t'ai dessiné une caisse. Le mouton était dedans, tu t'en souviens ?",
        panne: "Mon moteur est en pièces. Il faut que je trouve de l'eau avant d'y penser.",
        soif: "Huit jours dans ce désert… L'eau commence à manquer sérieusement.",
      },
    },
  },

  journal: {
    b612_arrivee: {
      titre: 'Ma petite planète',
      texte:
        'Elle tient tout entière dans le regard. Deux volcans en activité, un éteint — on ne sait jamais. Et ma rose, là-bas, sous son globe.',
    },
    b612_rose: {
      titre: 'La rose',
      texte:
        "Elle est capricieuse, orgueilleuse, et parfois mensongère. Mais elle est ma rose. C'est ce qui compte.",
    },
    b612_baobabs: {
      titre: 'Les baobabs',
      texte:
        "Il faut s'en occuper chaque matin, avant qu'ils ne deviennent trop grands pour être arrachés. C'est une question de discipline.",
    },
    b612_volcan: {
      titre: 'Les volcans',
      texte:
        "Un volcan bien ramoné brûle doucement, régulièrement. C'est utile pour faire chauffer le petit déjeuner.",
    },
    b612_coucher: {
      titre: 'Quarante-trois couchers de soleil',
      texte:
        'Quand on est très triste, on aime les couchers de soleil. Il suffit de tirer sa chaise de quelques pas.',
    },
    desert_etoiles: {
      titre: 'Les étoiles',
      texte:
        'La nuit, dans le désert, les étoiles sont si proches. Je me demande si chacun peut retrouver la sienne.',
    },
  },

  ui: {
    journal: 'Journal',
    fermer: 'Fermer',
    continuer: 'Continuer',
    interagir: 'Interagir',
    observer: 'Observer',
    arroser: 'Arroser la rose',
    ramoner: 'Ramoner le volcan',
    arracher: 'Arracher le baobab',
    mettreGlobe: 'Mettre le globe',
    aide: 'ZQSD · Flèches : marcher  ·  Maj : courir  ·  E : interagir  ·  J : journal  ·  Clic gauche : orbiter  ·  Molette : zoom  ·  1 : Désert  ·  2 : B-612',
  },

  lieux: {
    desert: { nom: 'Le Désert', description: `Un désert à mille milles de toute région habitée.` },
    b612: { nom: 'Astéroïde B-612', description: `Une planète à peine plus grande qu'une maison.` },
  },
} as const;

export type TextesFR = typeof FR;
