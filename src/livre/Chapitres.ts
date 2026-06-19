/**
 * Contenu du livre — extraits courts sous droit de courte citation
 * + paraphrases dans le style de l'œuvre (Vision §17).
 *
 * Le Petit Prince reste sous droit d'auteur en France jusqu'au 1er mai 2032.
 * Cette intégration respecte le droit de courte citation à des fins
 * pédagogiques et culturelles : chaque chapitre contient un extrait littéral
 * limité (généralement < 100 mots) accompagné d'un résumé reformulé.
 */

export interface ChapitreLivre {
  numero: number | 'dedicace';
  titre: string;
  /** Citation littérale courte (sous droit de courte citation). */
  extrait: string;
  /** Résumé/paraphrase du reste du chapitre, écrit dans le style original. */
  paraphrase: string;
  /** Référence à la scène du jeu correspondante (pour le marquage "vécu"). */
  sceneAssociee?: string;
  /** Objectif de progression qui marque ce chapitre comme « vécu ». */
  objectifAssocie?: string;
}

export const CHAPITRES: ChapitreLivre[] = [
  {
    numero: 'dedicace',
    titre: 'À Léon Werth',
    extrait:
      `« Je demande pardon aux enfants d'avoir dédié ce livre à une grande personne. ` +
      `J'ai une excuse sérieuse : cette grande personne est le meilleur ami que j'ai au monde. »`,
    paraphrase:
      `Saint-Exupéry dédie le livre à son ami Léon Werth, qu'il imagine enfant. ` +
      `Toutes les grandes personnes ont d'abord été des enfants — mais peu s'en souviennent.`,
  },
  {
    numero: 1,
    titre: 'Le boa et le chapeau',
    extrait:
      `« Mon dessin ne représentait pas un chapeau. Il représentait un serpent boa ` +
      `qui digérait un éléphant. »`,
    paraphrase:
      `L'enfant narrateur a dessiné un boa avalant un éléphant. Les grandes personnes y voient un chapeau. ` +
      `Découragé, il abandonne le dessin et apprend à piloter des avions. Depuis, il vit seul, sans personne à qui parler vraiment.`,
  },
  {
    numero: 2,
    titre: 'La rencontre dans le désert',
    extrait: `« — S'il vous plaît… dessine-moi un mouton ! »`,
    paraphrase:
      `Le pilote tombe en panne dans le Sahara. À mille milles de toute terre habitée, ` +
      `une drôle de petite voix le réveille à l'aube. Un petit bonhomme extraordinaire lui demande de dessiner un mouton. ` +
      `Après plusieurs essais refusés, le pilote dessine une caisse — le mouton est dedans. C'est ainsi qu'il fit la connaissance du petit prince.`,
    sceneAssociee: 'desert',
    objectifAssocie: 'parler_aviateur_accueil',
  },
  {
    numero: 3,
    titre: `D'où venait-il ?`,
    extrait: `« Alors, toi aussi tu viens du ciel ! De quelle planète es-tu ? »`,
    paraphrase:
      `Peu à peu, par hasard, le pilote apprend que le petit prince vient d'une autre planète. ` +
      `Sa planète d'origine est minuscule — à peine plus grande qu'une maison.`,
    sceneAssociee: 'b612',
  },
  {
    numero: 4,
    titre: `L'astéroïde B-612`,
    extrait:
      `« Les grandes personnes aiment les chiffres. Quand vous leur parlez d'un nouvel ami, ` +
      `elles ne vous questionnent jamais sur l'essentiel. »`,
    paraphrase:
      `Le narrateur explique que la planète du petit prince est sans doute l'astéroïde B-612, ` +
      `aperçu par un astronome turc en 1909. Les grandes personnes n'écoutent qu'on leur parle de chiffres. ` +
      `Mais nous, qui comprenons la vie, nous nous moquons bien des numéros.`,
    sceneAssociee: 'b612',
  },
  {
    numero: 5,
    titre: 'Les baobabs',
    extrait:
      `« C'est une question de discipline. Quand on a terminé sa toilette du matin, ` +
      `il faut faire soigneusement la toilette de la planète. »`,
    paraphrase:
      `Sur la planète du petit prince poussent de bonnes et de mauvaises graines. ` +
      `Les baobabs, si on les laisse grandir, font éclater la planète. Il faut les arracher dès qu'on les distingue des rosiers. ` +
      `Enfants, faites attention aux baobabs !`,
    sceneAssociee: 'b612',
    objectifAssocie: 'parler_aviateur_baobabs',
  },
  {
    numero: 6,
    titre: 'Les couchers de soleil',
    extrait: `« Tu sais… quand on est tellement triste on aime les couchers de soleil… »`,
    paraphrase:
      `Sur sa toute petite planète, il suffisait au petit prince de tirer sa chaise de quelques pas ` +
      `pour voir un coucher de soleil chaque fois qu'il le désirait. Un jour, il en vit quarante-trois.`,
    sceneAssociee: 'b612',
    objectifAssocie: 'observer_coucher_soleil',
  },
  {
    numero: 7,
    titre: `La guerre des moutons et des fleurs`,
    extrait:
      `« Si quelqu'un aime une fleur qui n'existe qu'à un exemplaire dans les millions et les millions d'étoiles, ` +
      `ça suffit pour qu'il soit heureux quand il les regarde. »`,
    paraphrase:
      `Le petit prince s'inquiète : si les moutons mangent les fleurs à épines, à quoi servent les épines ? ` +
      `Le narrateur, occupé par sa panne, lui répond avec irritation. Le petit prince éclate en sanglots — quelque part dans les étoiles, ` +
      `il aime une fleur unique qu'un mouton pourrait anéantir.`,
    sceneAssociee: 'b612',
  },
  {
    numero: 8,
    titre: 'La fleur',
    extrait:
      `« J'aurais dû la juger sur les actes et non sur les mots. ` +
      `Elle m'embaumait et m'éclairait. Je n'aurais jamais dû m'enfuir ! »`,
    paraphrase:
      `Une graine apportée d'on ne sait où germe sur la planète. C'est une fleur magnifique, mais coquette et vaniteuse. ` +
      `Elle se plaint des courants d'air, exige un globe le soir, parle de tigres. Le petit prince, trop jeune, ne sait pas l'aimer.`,
    sceneAssociee: 'b612',
    objectifAssocie: 'parler_aviateur_rose',
  },
  {
    numero: 9,
    titre: `L'évasion`,
    extrait: `« Mais oui, je t'aime, lui dit la fleur. Tu n'en as rien su, par ma faute. »`,
    paraphrase:
      `Profitant d'une migration d'oiseaux sauvages, le petit prince quitte sa planète. ` +
      `Il met tout en ordre, ramone ses volcans, arrache les dernières pousses de baobabs. Au moment de l'adieu, la fleur, pour la première fois, ` +
      `est douce. Elle lui demande pardon, lui souhaite d'être heureux, et refuse le globe — elle est une fleur, dit-elle.`,
    sceneAssociee: 'b612',
  },
  {
    numero: 10,
    titre: 'Le Roi',
    extrait:
      `« Il faut exiger de chacun ce que chacun peut donner. ` +
      `L'autorité repose d'abord sur la raison. »`,
    paraphrase:
      `Sur la première planète vit un roi vêtu de pourpre et d'hermine, qui règne sur tout — même sur les étoiles. ` +
      `Mais sa planète est minuscule et il n'a aucun sujet. Il propose au petit prince d'être ministre de la justice, ` +
      `puis son ambassadeur. « Les grandes personnes sont bien étranges », pense le petit prince.`,
    sceneAssociee: 'planete-roi',
    objectifAssocie: 'visiter_roi',
  },
  {
    numero: 11,
    titre: 'Le Vaniteux',
    extrait: `« Les vaniteux n'entendent jamais que les louanges. »`,
    paraphrase:
      `Le vaniteux porte un drôle de chapeau pour saluer ceux qui l'acclament. Il ne voit dans le petit prince qu'un admirateur. ` +
      `« Admirer signifie reconnaître que je suis l'homme le plus beau, le mieux habillé, le plus riche et le plus intelligent de la planète. » ` +
      `Mais il est seul sur sa planète. « Les grandes personnes sont décidément bien bizarres », se dit le petit prince.`,
    sceneAssociee: 'planete-vaniteux',
    objectifAssocie: 'visiter_vaniteux',
  },
  {
    numero: 12,
    titre: 'Le Buveur',
    extrait:
      `« — Pourquoi bois-tu ? — Pour oublier. — Pour oublier quoi ? — Pour oublier que j'ai honte. ` +
      `— Honte de quoi ? — Honte de boire ! »`,
    paraphrase:
      `La visite au buveur, installé en silence devant ses collections de bouteilles vides et pleines, ` +
      `plonge le petit prince dans une grande mélancolie.`,
    sceneAssociee: 'planete-buveur',
    objectifAssocie: 'visiter_buveur',
  },
  {
    numero: 13,
    titre: 'Le Businessman',
    extrait: `« Moi, si je possède une fleur, je puis cueillir ma fleur et l'emporter. Mais tu ne peux pas cueillir les étoiles ! »`,
    paraphrase:
      `Le businessman compte les étoiles : cinq cent un millions six cent vingt-deux mille sept cent trente et un. ` +
      `Il les possède puisqu'il y a pensé le premier. Il les place en banque sur un petit papier. ` +
      `« Tu n'es pas utile aux étoiles », lui dit le petit prince.`,
    sceneAssociee: 'planete-businessman',
    objectifAssocie: 'visiter_businessman',
  },
  {
    numero: 14,
    titre: `L'Allumeur de réverbères`,
    extrait:
      `« Celui-là est le seul dont j'eusse pu faire mon ami. Mais sa planète est vraiment trop petite. ` +
      `Il n'y a pas de place pour deux… »`,
    paraphrase:
      `Sur la cinquième planète, juste assez grande pour un réverbère et son allumeur, ce dernier travaille sans répit. ` +
      `La planète tourne désormais une fois par minute. Il allume et éteint sans pouvoir se reposer. ` +
      `Fidèle à la consigne, il pense aux autres. C'est le seul que le petit prince trouve digne d'amitié.`,
    sceneAssociee: 'planete-allumeur',
    objectifAssocie: 'visiter_allumeur',
  },
  {
    numero: 15,
    titre: 'Le Géographe',
    extrait: `« Ma fleur est éphémère, se dit le petit prince, et elle n'a que quatre épines pour se défendre contre le monde ! »`,
    paraphrase:
      `Le géographe écrit d'énormes livres mais ne quitte jamais son bureau. Il ne sait rien de sa propre planète. ` +
      `Il ne note pas les fleurs — elles sont éphémères, menacées de disparition prochaine. Le petit prince songe à sa fleur ` +
      `et regrette pour la première fois. Le géographe lui conseille de visiter la Terre.`,
    sceneAssociee: 'planete-geographe',
    objectifAssocie: 'visiter_geographe',
  },
  {
    numero: 16,
    titre: 'La Terre',
    extrait: `« La septième planète fut donc la Terre. La Terre n'est pas une planète quelconque ! »`,
    paraphrase:
      `Le narrateur décrit la Terre : cent onze rois, sept mille géographes, neuf cent mille businessmen, ` +
      `sept millions et demi d'ivrognes, trois cent onze millions de vaniteux. Avant l'électricité, une armée de quatre cent ` +
      `soixante-deux mille cinq cent onze allumeurs de réverbères y dansait un ballet d'opéra à travers les continents.`,
    sceneAssociee: 'terre',
  },
  {
    numero: 17,
    titre: 'Le Serpent',
    extrait: `« On est seul aussi chez les hommes, dit le serpent. »`,
    paraphrase:
      `Tombé en Afrique, le petit prince ne voit personne. Un serpent doré, mince comme un doigt, ` +
      `surgit dans le sable. Il parle par énigmes. « Celui que je touche, je le rends à la terre dont il est sorti. ` +
      `Mais tu es pur et tu viens d'une étoile. » Il propose de l'aider, un jour, s'il regrette trop sa planète.`,
    sceneAssociee: 'terre',
  },
  {
    numero: 18,
    titre: 'La fleur du désert',
    extrait: `« Les hommes ? Il en existe, je crois, six ou sept. Le vent les promène. Ils manquent de racines, ça les gêne beaucoup. »`,
    paraphrase:
      `Le petit prince traverse le désert et ne rencontre qu'une fleur à trois pétales, une fleur de rien du tout, ` +
      `qui a vu passer une caravane il y a longtemps.`,
    sceneAssociee: 'terre',
  },
  {
    numero: 19,
    titre: `L'écho de la montagne`,
    extrait: `« Quelle drôle de planète ! Elle est toute sèche, et toute pointue et toute salée. Et les hommes manquent d'imagination. »`,
    paraphrase:
      `Le petit prince gravit une haute montagne aux aiguilles de roc bien aiguisées. ` +
      `Il dit bonjour. L'écho lui répond bonjour. Il demande qui ils sont. L'écho répète. Chez lui, sa fleur parlait toujours la première.`,
    sceneAssociee: 'terre',
  },
  {
    numero: 20,
    titre: 'Le jardin de roses',
    extrait:
      `« Je me croyais riche d'une fleur unique, et je ne possède qu'une rose ordinaire. ` +
      `Ça et mes trois volcans qui m'arrivent au genou… »`,
    paraphrase:
      `Le petit prince découvre un jardin fleuri de roses, toutes semblables à la sienne — cinq mille, dans un seul jardin. ` +
      `Sa fleur lui avait dit être unique au monde. Couché dans l'herbe, il pleure.`,
    sceneAssociee: 'terre',
  },
  {
    numero: 21,
    titre: 'Le Renard',
    extrait:
      `« On ne voit bien qu'avec le cœur. L'essentiel est invisible pour les yeux. ` +
      `C'est le temps que tu as perdu pour ta rose qui fait ta rose si importante. »`,
    paraphrase:
      `Sous un pommier, un renard apparaît. Il refuse de jouer — il n'est pas apprivoisé. Apprivoiser, c'est créer des liens. ` +
      `Il faut être très patient : s'asseoir d'abord un peu loin, puis chaque jour s'asseoir un peu plus près. Le langage est source de malentendus. ` +
      `Il faut des rites. Le petit prince apprivoise le renard. Au moment de l'adieu, le renard lui offre son secret. ` +
      `« Tu deviens responsable pour toujours de ce que tu as apprivoisé. »`,
    sceneAssociee: 'terre',
    objectifAssocie: 'rencontrer_renard',
  },
  {
    numero: 22,
    titre: `L'Aiguilleur`,
    extrait: `« Les enfants seuls savent ce qu'ils cherchent. »`,
    paraphrase:
      `L'aiguilleur trie les voyageurs par paquets de mille, expédiant les trains à droite ou à gauche. ` +
      `Les voyageurs ne savent pas ce qu'ils cherchent. Seuls les enfants écrasent leur nez contre les vitres.`,
  },
  {
    numero: 23,
    titre: 'Le Marchand',
    extrait: `« Moi, se dit le petit prince, si j'avais cinquante-trois minutes à dépenser, je marcherais tout doucement vers une fontaine… »`,
    paraphrase:
      `Le marchand vend des pilules qui apaisent la soif. Une par semaine, et l'on n'éprouve plus le besoin de boire. ` +
      `Cinquante-trois minutes d'économisées.`,
  },
  {
    numero: 24,
    titre: 'Le puits',
    extrait: `« Ce qui embellit le désert, dit le petit prince, c'est qu'il cache un puits quelque part… »`,
    paraphrase:
      `Huitième jour dans le désert. Le pilote n'a plus d'eau. Le petit prince propose de chercher un puits. ` +
      `Ils marchent des heures sous les étoiles. Le pilote porte son petit prince endormi. Au lever du jour, ils découvrent le puits.`,
    sceneAssociee: 'desert',
    objectifAssocie: 'trouver_puits',
  },
  {
    numero: 25,
    titre: `L'eau du puits`,
    extrait: `« Les yeux sont aveugles. Il faut chercher avec le cœur. »`,
    paraphrase:
      `Le puits ressemble à un puits de village — poulie, seau, corde. L'eau est née de la marche sous les étoiles, ` +
      `du chant de la poulie, de l'effort des bras. Bonne pour le cœur, comme un cadeau de Noël. ` +
      `Le petit prince annonce que demain sera l'anniversaire de sa chute sur la Terre.`,
    sceneAssociee: 'desert',
  },
  {
    numero: 26,
    titre: 'Le départ',
    extrait:
      `« Il n'y eut rien qu'un éclair jaune près de sa cheville. Il demeura un instant immobile. ` +
      `Il ne cria pas. Il tomba doucement comme tombe un arbre. Ça ne fit même pas de bruit, à cause du sable. »`,
    paraphrase:
      `Au mur de pierre, le petit prince retrouve le serpent jaune. Il dit adieu au pilote, lui promet que les étoiles riront pour lui, ` +
      `et qu'il aura, comme personne, des étoiles qui savent rire. Il a peur, mais il y va seul. Son corps est trop lourd pour faire le voyage du retour.`,
    sceneAssociee: 'finale',
  },
  {
    numero: 27,
    titre: 'Épilogue',
    extrait:
      `« Regardez le ciel. Demandez-vous : le mouton oui ou non a-t-il mangé la fleur ? ` +
      `Et vous verrez comme tout change… Et aucune grande personne ne comprendra jamais que ça a tellement d'importance ! »`,
    paraphrase:
      `Six ans ont passé. Le narrateur écoute les étoiles la nuit — comme cinq cents millions de grelots. ` +
      `Il a oublié de dessiner la courroie de cuir sur la muselière. Le mouton a-t-il mangé la fleur ? ` +
      `Si vous passez un jour par le désert d'Afrique, ne vous pressez pas. Attendez sous l'étoile. Si un enfant vient à vous, ` +
      `s'il rit, s'il a des cheveux d'or, s'il ne répond pas aux questions, écrivez-moi vite qu'il est revenu.`,
    sceneAssociee: 'finale',
  },
];
