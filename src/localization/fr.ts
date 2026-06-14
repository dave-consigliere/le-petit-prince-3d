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
    planete_roi: {
      titre: 'Le Roi',
      texte: `Il règne sur tout — les étoiles lui obéissent. Mais il n'a pas de sujets. Un roi sans personne est-il encore un roi ?`,
    },
    planete_vaniteux: {
      titre: 'Le Vaniteux',
      texte: `Il ne veut qu'être admiré. Applaudir, c'est sa seule conversation. Les grandes personnes sont décidément bien bizarres.`,
    },
    planete_buveur: {
      titre: 'Le Buveur',
      texte: `Il boit pour oublier sa honte de boire. Cette visite m'a plongé dans une grande mélancolie.`,
    },
    planete_businessman: {
      titre: 'Le Businessman',
      texte: `Il possède les étoiles — il les compte, les recompte, les place en banque. Mais elles ne l'éclairent pas pour autant.`,
    },
    planete_allumeur: {
      titre: `L'Allumeur de réverbères`,
      texte: `Il est fidèle à la consigne, même absurde. C'est le seul qui ne pense pas qu'à lui-même. J'aurais pu en faire mon ami.`,
    },
    planete_geographe: {
      titre: 'Le Géographe',
      texte: `Il m'a dit que ma fleur est éphémère. Ce mot m'a traversé comme une lame. Je l'ai laissée seule sur ma planète.`,
    },
    conseil_terre: {
      titre: 'Vers la Terre',
      texte: `Le géographe m'a conseillé la Terre. Elle a bonne réputation, dit-il. J'y suis allé, songeant à ma fleur.`,
    },
    terre_arrivee: {
      titre: `L'arrivée sur Terre`,
      texte: `J'ai cru d'abord m'être trompé de planète. Pas un homme. Juste le sable, le vent, et au-dessus, les étoiles.`,
    },
    terre_serpent: {
      titre: 'Le Serpent',
      texte: `Il est apparu sans bruit, anneau couleur de lune dans le sable. Il parle par énigmes. Il dit pouvoir me ramener un jour, si je regrette trop ma planète.`,
    },
    terre_echo: {
      titre: `L'écho de la montagne`,
      texte: `J'ai dit « bonjour » et la montagne a dit « bonjour bonjour bonjour ». Les hommes manquent d'imagination — ils répètent ce qu'on leur dit.`,
    },
    terre_jardin: {
      titre: 'Cinq mille roses',
      texte: `Je me croyais riche d'une fleur unique. Et je ne possède qu'une rose ordinaire. Ça ne fait pas de moi un bien grand prince.`,
    },
    terre_renard_curieux: {
      titre: `Le Renard m'a vu`,
      texte: `Il est sous le pommier. Il m'a vu. Il dit qu'il ne peut pas jouer — il n'est pas apprivoisé.`,
    },
    terre_renard_attentif: {
      titre: `Qu'est-ce que signifie « apprivoiser » ?`,
      texte: `Ça veut dire « créer des liens », m'a-t-il dit. Pour l'instant, je ne suis qu'un petit garçon parmi cent mille autres.`,
    },
    terre_renard_familier: {
      titre: 'Il faut être patient',
      texte: `Il faut être très patient, dit-il. S'asseoir d'abord un peu loin. Et chaque jour, s'asseoir un peu plus près. Le langage est source de malentendus.`,
    },
    terre_renard_ami: {
      titre: 'Le secret du Renard',
      texte: `On ne voit bien qu'avec le cœur. L'essentiel est invisible pour les yeux. C'est le temps que tu as perdu pour ta rose qui fait ta rose si importante.`,
    },
    terre_ble: {
      titre: 'Les champs de blé',
      texte: `Je ne mange pas de pain. Le blé pour moi est inutile. Mais tu as des cheveux couleur d'or — alors le blé me fera souvenir de toi.`,
    },
    desert_rencontre: {
      titre: `La rencontre`,
      texte: `Il est apparu au lever du jour, dans ce désert où je me croyais seul. Dessine-moi un mouton, a-t-il dit. Simplement.`,
    },
    desert_mouton: {
      titre: `Le mouton dans la caisse`,
      texte: `J'ai dessiné une caisse. Le mouton était dedans. Il a souri — c'est tout à fait comme ça qu'il le voulait.`,
    },
    desert_origine: {
      titre: `L'astéroïde B-612`,
      texte: `Il venait d'une toute petite planète. À peine plus grande qu'une maison, quelque part dans les étoiles.`,
    },
    desert_baobabs: {
      titre: `La discipline des baobabs`,
      texte:
        'Il faut arracher les mauvaises graines chaque matin. Si on tarde, elles deviennent des baobabs. Et les baobabs font éclater les planètes.',
    },
    desert_puits: {
      titre: `L'eau bonne pour le cœur`,
      texte: `Nous avons marché des heures dans l'obscurité. L'eau du puits avait un goût différent — comme si la marche sous les étoiles l'avait rendue meilleure.`,
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
    carte: 'Carte des planètes',
    sauvegarder: 'Sauvegarder',
    nouvellePartie: 'Nouvelle partie',
    aide: 'ZQSD · Flèches : marcher  ·  Maj : courir  ·  E : interagir  ·  J : journal  ·  M : carte  ·  1-9 : scènes  ·  Clic gauche : orbiter  ·  Molette : zoom',
  },

  lieux: {
    desert: { nom: 'Le Désert', description: `Un désert à mille milles de toute région habitée.` },
    b612: { nom: 'Astéroïde B-612', description: `Une planète à peine plus grande qu'une maison.` },
  },
} as const;

export type TextesFR = typeof FR;
