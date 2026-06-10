# Analyse de l'œuvre — *Le Petit Prince*

**Projet :** Le Petit Prince – Une Aventure Interactive 3D
**Source de référence :** PDF `st_exupery_le_petit_prince.pdf` (texte intégral, 27 chapitres)
**Objet :** Document de préproduction (Phase 1). Sert de référence canonique pour toutes les décisions de game design, de narration et de direction artistique.

> Conformément aux contraintes du projet, ce document **reformule** le contenu du livre : aucune citation longue n'y figure. Les dialogues du jeu seront des adaptations fidèles à l'esprit et au ton de l'œuvre.

---

# 1. Structure narrative du livre

## 1.1 Chronologie des événements (ordre du récit)

| # | Chapitres | Événement | Lieu |
|---|-----------|-----------|------|
| 1 | I | Prologue de l'Aviateur : le dessin du boa, l'incompréhension des grandes personnes | — (souvenir d'enfance) |
| 2 | II | Panne dans le Sahara, rencontre du Petit Prince, le mouton dessiné dans une caisse | Désert |
| 3 | III–IV | Révélation progressive de l'origine du Prince : l'astéroïde B-612 | Désert (récit) |
| 4 | V | Le drame des baobabs : discipline quotidienne, danger des mauvaises graines | B-612 (récit) |
| 5 | VI | Les couchers de soleil — la mélancolie (les 43 couchers de soleil) | B-612 (récit) |
| 6 | VII | La querelle des épines : le Prince défend l'importance de sa fleur | Désert |
| 7 | VIII | Histoire de la Rose : sa naissance, sa coquetterie, ses quatre épines | B-612 (récit) |
| 8 | IX | Le départ : ramonage des volcans, adieux à la Rose qui avoue son amour | B-612 (récit) |
| 9 | X | Astéroïde 325 : le Roi | Planète du Roi |
| 10 | XI | Astéroïde 326 : le Vaniteux | Planète du Vaniteux |
| 11 | XII | Astéroïde 327 : le Buveur | Planète du Buveur |
| 12 | XIII | Astéroïde 328 : le Businessman | Planète du Businessman |
| 13 | XIV | Astéroïde 329 : l'Allumeur de réverbères | Planète de l'Allumeur |
| 14 | XV | Astéroïde 330 : le Géographe, qui lui conseille la Terre et lui apprend le mot « éphémère » | Planète du Géographe |
| 15 | XVI–XVII | Arrivée sur Terre, en Afrique : rencontre du Serpent | Désert terrestre |
| 16 | XVIII–XIX | La fleur à trois pétales ; l'écho de la montagne | Désert, montagnes |
| 17 | XX | Le jardin de cinq mille roses : la crise existentielle du Prince | Jardin de roses |
| 18 | XXI | Le Renard : l'apprivoisement, les rites, le secret | Champs de blé, pommier |
| 19 | XXII–XXIII | L'Aiguilleur et le Marchand de pilules : la satire de la hâte des hommes | Voie ferrée / route |
| 20 | XXIV–XXV | La marche dans le désert et la découverte du puits ; l'eau « bonne pour le cœur » | Désert, puits |
| 21 | XXVI | L'anniversaire de la chute, le rendez-vous avec le Serpent, le départ du Prince | Mur de pierre, désert |
| 22 | XXVII | Épilogue : six ans plus tard, le mystère du mouton et de la fleur ; l'appel au lecteur | — |

## 1.2 Double temporalité

Le récit emboîte deux temps :

* **le présent** : huit jours dans le désert (panne → réparation → départ du Prince) ;
* **le passé raconté** : la vie sur B-612 et le voyage de planète en planète.

**Conséquence pour le jeu :** cette structure justifie un dispositif de **souvenirs jouables**. Le joueur incarne le Petit Prince dans les séquences-souvenirs (B-612, les six planètes, l'arrivée sur Terre) tandis que le désert avec l'Aviateur sert de **hub narratif** au présent. C'est fidèle au livre et cela résout élégamment le problème du point de vue.

---

# 2. Personnages

| Personnage | Traits essentiels (issus du texte) | Fonction symbolique | Notes de design |
|---|---|---|---|
| **Le Petit Prince** | Cheveux dorés, cache-nez d'or, rire cristallin ; ne renonce jamais à une question posée ; ne répond pas aux questions qu'on lui pose ; rougit pour dire oui | L'enfance, le regard pur | Avatar jouable dans les souvenirs ; animations de contemplation |
| **L'Aviateur** | Narrateur ; pressé par la panne et la soif ; redevient peu à peu enfant | Le passage adulte/enfant | PNJ du hub désert ; ton chaleureux, parfois las |
| **La Rose** | Coquette, orgueilleuse, quatre épines, peur des courants d'air, globe de verre ; avoue son amour au départ | L'amour imparfait mais unique | Animations subtiles (pétales, toux) ; voix douce |
| **Le Renard** | Demande à être apprivoisé ; rites, patience, blé doré ; livre le secret final | L'amitié, les liens | Personnage clé ; IA d'approche progressive (s'éloigne si on court) |
| **Le Serpent** | Mince comme un doigt, parle par énigmes, anneau couleur de lune ; « plus puissant qu'un doigt de roi » | La mort, le retour | Présence inquiétante mais jamais hostile ; lumière lunaire |
| **Le Roi** | Manteau d'hermine envahissant ; ordres « raisonnables » ; nomme le Prince ministre puis ambassadeur | L'autorité vide | Planète pourpre ; mise en scène du manteau couvrant tout |
| **Le Vaniteux** | Chapeau pour saluer ; n'entend que les louanges | La vanité | Boucle d'interaction : applaudir → saluer |
| **Le Buveur** | Boit pour oublier sa honte de boire ; visite très courte, mélancolique | Le cercle vicieux | Ambiance sombre, brève ; traiter avec pudeur (public scolaire) |
| **Le Businessman** | Compte 501 622 731 étoiles ; les « possède » ; trois dérangements en 54 ans | La possession absurde | Bureau, papiers, ambiance grise et répétitive |
| **L'Allumeur** | Fidèle à la consigne ; planète tournant en 1 minute ; le seul que le Prince aurait voulu pour ami | Le devoir, l'attention aux autres | Planète minuscule ; cycle jour/nuit accéléré spectaculaire |
| **Le Géographe** | N'explore jamais ; registres éternels ; définit « éphémère » | Le savoir détaché du réel | Grands livres ; déclencheur du regret de la Rose |
| **L'Aiguilleur / le Marchand** | Les hommes pressés ne savent pas ce qu'ils cherchent | La hâte moderne | Scènes courtes optionnelles sur Terre |
| **La fleur à trois pétales / l'Écho** | Solitude du désert terrestre | La Terre vide d'hommes | Micro-rencontres contemplatives |

---

# 3. Lieux et identités visuelles

| Lieu | Éléments canoniques | Palette / lumière | Ambiance sonore |
|---|---|---|---|
| **Désert (hub)** | Avion en panne, dunes, puits de village (poulie, seau, corde), mur de pierre, ciel étoilé | Ocre, miel au lever du jour, bleu profond la nuit | Vent, silence, grincement de poulie |
| **B-612** | Taille d'une maison ; 2 volcans actifs (chauffent le déjeuner), 1 éteint (tabouret), Rose sous globe, pousses de baobabs, chaise des couchers de soleil | Pastels chauds, crépuscules permanents possibles | Souffle léger, crépitement des volcans |
| **Planète du Roi** | Trône simple, manteau d'hermine recouvrant la planète | Pourpre, or | Solennité feutrée |
| **Planète du Vaniteux** | Vide, le personnage et son chapeau | Tons clairs, théâtre | Applaudissements, silence gênant |
| **Planète du Buveur** | Bouteilles pleines et vides | Tons éteints, brume | Quasi-silence |
| **Planète du Businessman** | Bureau, papiers, cigarette éteinte | Gris, brun, lumière froide | Marmonnement de chiffres |
| **Planète de l'Allumeur** | La plus petite : un réverbère, son allumeur | Alternance rapide jour/nuit | Allumage/extinction rythmés |
| **Planète du Géographe** | 10× plus vaste, bureau, registres énormes | Bibliothèque, sépia | Pages, plume |
| **Terre** | Désert d'Afrique, montagnes aiguës (écho), jardin de 5 000 roses, champs de blé, pommier, voie ferrée | Variée ; blé doré central (lien Renard) | Oiseaux, vent dans le blé, trains |

---

# 4. Thèmes philosophiques (à traduire en mécaniques)

1. **« On ne voit bien qu'avec le cœur »** → mécanique d'observation : certains éléments ne se révèlent qu'en s'arrêtant, en s'asseyant, en attendant.
2. **L'apprivoisement et les rites** (Renard) → mécanique de patience : revenir au même endroit, s'approcher graduellement, respecter une heure.
3. **Le temps « perdu » qui rend unique** → le journal valorise le temps passé auprès de la Rose, du Renard.
4. **La critique des grandes personnes** (chiffres, possession, vanité, hâte) → chaque planète est une vignette satirique jouable.
5. **La responsabilité** (« tu deviens responsable de ce que tu as apprivoisé ») → arroser la Rose, protéger, revenir.
6. **L'éphémère et la perte** → fin douce-amère ; le serpent traité avec poésie, jamais avec violence.
7. **L'essentiel invisible** → direction artistique : suggérer plutôt que montrer ; usage narratif du silence et du vide.

---

# 5. Objets interactifs canoniques

Dessin du mouton dans sa caisse · muselière (sans courroie ! détail crucial de l'épilogue) · globe de verre · paravent · arrosoir · volcans à ramoner · pousses de baobabs à arracher · chaise des couchers de soleil · trône et manteau du Roi · chapeau du Vaniteux · bouteilles · registre et crayon du Géographe · réverbère · puits (poulie, corde, seau) · mur de pierre · avion à réparer · épis de blé.

---

# 6. Détails canoniques à ne jamais contredire

* B-612 a été observé en 1909 par un astronome turc, cru seulement en 1920.
* Le Prince a vu **43** couchers de soleil en un jour de tristesse (le texte mentionne aussi 44 au chap. X — le jeu retiendra 43, valeur du chapitre VI, la plus citée).
* La Rose a **quatre** épines.
* Trois volcans : deux actifs, un éteint (« on ne sait jamais »).
* Le séjour sur Terre dure **un an** ; la rencontre avec l'Aviateur, **huit jours**.
* Le Renard demande des **rites** et donne son secret en trois temps (le cœur, le temps perdu, la responsabilité).
* La muselière dessinée n'a **pas de courroie** — source du doute final.
* Le corps du Prince a disparu au matin.

---

# 7. Implications directes pour le game design

1. **Structure** : hub Désert (présent) + souvenirs jouables (passé), déverrouillés au fil des conversations avec l'Aviateur sur 8 « jours » narratifs.
2. **Aucun échec possible** : pas de mort, pas de combat, pas de chrono punitif. Les « défis » sont des rituels (apprivoiser, arroser, ramoner).
3. **Fin** : traitée en ellipse poétique (éclair jaune, chute douce « comme un arbre », sans bruit) puis épilogue contemplatif sous les étoiles, avec l'adresse finale au joueur.
4. **Ton des dialogues** : phrases courtes, questions répétées par le Prince, répliques décalées des grandes personnes — réécriture originale dans le style, sans citation longue.
