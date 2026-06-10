# TODO — Le Petit Prince : Une Aventure Interactive 3D

> **Objectif :** Suivre l'avancement du projet de manière claire, structurée et évolutive. Ce document doit être mis à jour après chaque session de développement.

---

# Légende

* ⬜ Non commencé
* 🟨 En cours
* 🟩 Terminé
* ⚠️ À corriger
* 🚀 Amélioration future

---

# Progression globale

| Domaine               | Progression |
| --------------------- | ----------: |
| Préproduction         |       100 % |
| Architecture          |        60 % |
| Gameplay              |        10 % |
| Environnements        |        15 % |
| Personnages           |        10 % |
| Interface utilisateur |         5 % |
| Dialogues             |         0 % |
| Audio                 |         0 % |
| Sauvegarde            |         0 % |
| Optimisation          |        15 % |
| Tests                 |        25 % |
| Documentation         |        45 % |
| **Projet global**     |    **19 %** |

---

# Phase 1 — Préproduction

## Documentation

* 🟩 Vision_du_projet.md
* 🟩 Architecture.md
* 🟩 Assets.md
* 🟩 README.md
* 🟩 Cahier des choix techniques (`docs/Plan_initial.md`)

## Analyse du livre

* 🟩 Identifier tous les personnages (`docs/Analyse_du_livre.md` §2)
* 🟩 Identifier tous les lieux (§3)
* 🟩 Identifier les dialogues importants (§2, §7 — réécritures prévues)
* 🟩 Identifier les objets interactifs (§5)
* 🟩 Identifier les thèmes philosophiques (§4)
* 🟩 Définir la chronologie (§1)

---

# Phase 2 — Mise en place du projet

## Initialisation

* 🟩 Création du projet Vite
* 🟩 Configuration TypeScript (mode strict + `noUncheckedIndexedAccess`)
* 🟩 Installation Three.js (chunk « vendor » séparé pour la mise en cache)
* 🟩 Configuration ESLint (flat config + typescript-eslint)
* 🟩 Configuration Prettier
* 🟨 Configuration Git (`.gitignore` créé ; dépôt à initialiser côté utilisateur)
* 🟩 Structure des dossiers (conforme à `Architecture.md` §4)

## Développement

* 🟩 Boucle principale (`core/GameLoop.ts` — pas fixe 60 Hz + rendu variable)
* 🟩 Gestionnaire de scènes (`scenes/SceneManager.ts` + contrat `ISceneModule`)
* 🟩 Gestionnaire des ressources (`engine/AssetManager.ts` — cache, GLTF+Draco prêt)
* 🟩 Gestionnaire des entrées clavier/souris (`engine/InputManager.ts`)
* 🟩 Caméra (`engine/CameraManager.ts` — base ; comportements au jalon M1)
* 🟩 Éclairage de base (scène de test : soleil chaud + hémisphérique)

## Acquis supplémentaires (hors liste initiale)

* 🟩 Bus d'événements typé (`engine/EventBus.ts`)
* 🟩 Service du temps avec échelle/pause (`engine/TimeService.ts`)
* 🟩 Journalisation 4 niveaux (`utilities/Logger.ts`, Architecture §13)
* 🟩 Prototype du rendu « aquarelle » : rampe toon douce (`shaders/RampeAquarelle.ts`)
  \+ post-traitement grain de papier & vignette (`shaders/PostAquarelle.ts`)
* 🟩 Scène de test « première aquarelle » (dunes, planète suspendue, étoiles, brume)
* 🟩 Tests unitaires Vitest : 10/10 verts (EventBus, TimeService, RampeAquarelle)
* 🟩 Indicateur FPS de développement

---

# Phase 3 — Joueur

* 🟩 Déplacement (contrôleur cinématique, relatif à la caméra, tangent au sol)
* 🟩 Course (Maj ; amortissement exponentiel des vitesses)
* 🟩 Collision (sol analytique exact + obstacles cylindriques avec glissement + limite du monde)
* 🟩 Caméra troisième personne (orbitale : clic gauche, zoom molette, ré-alignement gravité)
* ⬜ Caméra libre (mode photo — amélioration future)
* 🟨 Animation du joueur (procédurale sur avatar provisoire : marche, inclinaison, respiration)

## Acquis structurants du jalon M1

* 🟩 Abstraction `ChampGravite` (plan + sphérique) : le MÊME contrôleur marche
  sur le désert et autour d'une planète — la gravité de B-612 est validée
* 🟩 Bruit cohérent déterministe (`utilities/Bruit.ts`) : terrain visuel = sol physique
* 🟩 Avatar provisoire du Petit Prince (volumes stylisés, couleurs des aquarelles)
* 🟩 Scène prototype B-612 (3 volcans dont 1 éteint, rose provisoire, ciel étoilé)
* 🟩 Bascule de scènes de développement (touches 1/2) — préfigure le voyage interplanétaire

---

# Phase 4 — Environnements

## Désert

* 🟩 Terrain (bruit fractal déterministe, graine 612 ; fonction unique visuel + physique)
* 🟩 Dunes (4 octaves de fBm ; relief praticable validé par tests)
* 🟩 Rochers (14 rochers déterministes, obstacles avec glissement)
* ⬜ Puits
* ⬜ Avion
* 🟩 Éclairage (soleil chaud + hémisphérique, brume teintée papier)
* ⬜ Vent
* ⬜ Ambiance sonore

## Astéroïde B-612

* 🟨 Sol (sphère praticable — gravité sphérique validée ; relief définitif au M2)
* 🟨 Rose (volume provisoire ; version animée au M2)
* 🟨 Volcan actif (2 cônes provisoires)
* 🟨 Volcan éteint (cône provisoire, plus petit — « on ne sait jamais ! »)
* ⬜ Baobabs
* 🟩 Ciel étoilé (900 étoiles instanciées, fond nuit spatiale douce)

## Autres planètes

* ⬜ Roi
* ⬜ Vaniteux
* ⬜ Buveur
* ⬜ Businessman
* ⬜ Allumeur
* ⬜ Géographe

## Terre

* ⬜ Jardin de roses
* ⬜ Montagnes
* ⬜ Champs de blé
* ⬜ Désert final

---

# Phase 5 — Personnages

* ⬜ Petit Prince
* ⬜ Aviateur
* ⬜ Rose
* ⬜ Renard
* ⬜ Serpent
* ⬜ Roi
* ⬜ Vaniteux
* ⬜ Buveur
* ⬜ Businessman
* ⬜ Allumeur
* ⬜ Géographe

Pour chacun :

* ⬜ Modèle 3D
* ⬜ Animations
* ⬜ IA
* ⬜ Dialogues
* ⬜ Interactions

---

# Phase 6 — Dialogues

* ⬜ Système de dialogue
* ⬜ Fenêtre de dialogue
* ⬜ Historique
* ⬜ Choix de réponses (si pertinent)
* ⬜ Localisation
* ⬜ Synchronisation avec les événements

---

# Phase 7 — Gameplay

* ⬜ Interactions
* ⬜ Journal de voyage
* ⬜ Objets à observer
* ⬜ Déclencheurs narratifs
* ⬜ Voyages entre planètes
* ⬜ Système de progression

---

# Phase 8 — Interface utilisateur

* ⬜ Menu principal
* ⬜ Menu pause
* ⬜ Paramètres
* ⬜ Sauvegarde
* ⬜ Chargement
* 🟨 HUD (indicateur FPS de développement uniquement)
* ⬜ Journal
* ⬜ Carte

---

# Phase 9 — Audio

## Musiques

* ⬜ Menu
* ⬜ Désert
* ⬜ B-612
* ⬜ Renard
* ⬜ Fin

## Sons

* ⬜ Pas
* ⬜ Vent
* ⬜ Interface
* ⬜ Interactions
* ⬜ Ambiances

---

# Phase 10 — Effets visuels

* ⬜ Bloom
* 🟩 Brouillard (brume chaude par scène, prototype validé)
* ⬜ Profondeur de champ
* ⬜ Particules
* ⬜ Ciel dynamique
* 🟨 Étoiles (prototype `Points` — scintillement à venir)
* ⬜ Vent
* 🟩 Grain de papier & vignette (identité « aquarelle », post-traitement dédié)

---

# Phase 11 — Sauvegarde

* ⬜ Sauvegarde automatique
* ⬜ Sauvegarde manuelle
* ⬜ Chargement
* ⬜ Paramètres utilisateur
* ⬜ Progression

---

# Phase 12 — Optimisation

* 🟨 Chargement différé (chargeurs GLTF/Draco créés à la demande ; scènes en `import()` prévu)
* ⬜ Compression des textures
* 🟨 Compression Draco (chargeur configuré ; décodeur à copier dans `public/draco/` au M2)
* ⬜ LOD
* 🟩 Frustum Culling (natif Three.js, actif)
* ⬜ Object Pooling
* 🟨 Optimisation GPU (ratio de pixels plafonné à 2 ; chunk vendor séparé : jeu 22 ko gzip)
* ⬜ Optimisation CPU
* ⬜ Optimisation mémoire

---

# Phase 13 — Accessibilité

* ⬜ Sous-titres
* ⬜ Taille des textes
* ⬜ Contraste élevé
* ⬜ Reconfiguration des commandes
* ⬜ Réglages audio

---

# Phase 14 — Tests

## Fonctionnels

* ⬜ Navigation
* ⬜ Dialogues
* ⬜ Interactions
* ⬜ Sauvegarde
* ⬜ Interface

## Performances

* ⚠️ FPS (indicateur intégré ; **mesure à confirmer dans un navigateur réel** — le conteneur de développement n'a pas de GPU)
* ⬜ Temps de chargement
* ⬜ Consommation mémoire
* ⬜ Compatibilité navigateurs

## Régressions

* 🟩 Vérification complète après chaque fonctionnalité majeure (chaîne `tsc → vitest → eslint → build` verte)

---

# Phase 15 — Finalisation

* ⬜ Suppression des ressources temporaires
* ⬜ Nettoyage du code
* ⬜ Documentation complète
* ⬜ Vérification des licences
* ⬜ Optimisation finale
* ⬜ Relecture générale
* ⬜ Validation finale

---

# Améliorations futures

* 🚀 Mode Photo
* 🚀 Cycle jour/nuit
* 🚀 Météo dynamique
* 🚀 Succès
* 🚀 Galerie des illustrations
* 🚀 Narration audio
* 🚀 Compatibilité WebXR / VR
* 🚀 Version mobile
* 🚀 Support multilingue

---

# Notes de développement

## Session du 10/06/2026 (2) — Jalon M1 : Joueur

* **Objectif :** déplacement 3e personne agréable, collisions simples, caméra de suivi, et validation anticipée de la gravité sphérique de B-612.
* **Travaux réalisés :**
  * `physics/ChampGravite.ts` : abstraction du « haut » local et du sol (implémentations plan et sphérique) — le contrôleur et la caméra ignorent la forme du monde ;
  * `characters/joueur/ControleurJoueur.ts` : contrôleur cinématique testable sans DOM (commande + base caméra injectées), vitesses amorties, orientation tangente lissée ;
  * `physics/Obstacles.ts` : obstacles cylindriques avec glissement tangent (pas de moteur physique généraliste — choix assumé pour un jeu contemplatif) ;
  * `engine/CameraOrbitale.ts` : caméra orbitale (clic gauche, molette) dont le rig se ré-aligne en douceur sur le haut local — l'horizon bascule naturellement sur B-612 ;
  * `utilities/Bruit.ts` : bruit de valeur + fBm déterministe ; le terrain du désert et son sol physique partagent une seule fonction (collisions exactes par construction) ;
  * scènes `desert` (terrain fractal, 14 rochers-obstacles, planète suspendue) et `proto-b612` (sphère praticable, 3 volcans, rose provisoire) ; bascule 1/2 ;
  * avatar provisoire du Petit Prince (habit vert d'eau, cheveux et écharpe d'or) avec animation procédurale ; entrées étendues (ZQSD/WASD/flèches via codes physiques, orbite, molette) ;
  * 21 nouveaux tests (31 au total) dont : tour complet d'une planète en restant exactement à sa surface, avatar « debout » sur le flanc d'une sphère, glissement le long d'un rocher.
* **Difficultés rencontrées :** nouveaux fichiers parasites apparus dans le conteneur (dossier `Joueur/` en casse différente, `CameraSuivi.ts`, etc.) — supprimés ; la liste `find` est désormais vérifiée avant chaque validation.
* **Décisions techniques :**
  * zéro allocation par image dans le contrôleur, la caméra et les obstacles (vecteurs temporaires partagés) ;
  * les entrées utilisent les codes physiques (`KeyW` = touche Z en AZERTY) : compatibilité AZERTY/QWERTY automatique, flèches en secours ;
  * la limite du monde « glisse » le long du bord (pas de mur brutal) — cohérent avec l'expérience contemplative.
* **Prochaines étapes (jalon M2 — tranche verticale B-612) :**
  1. B-612 définitif : relief doux, Rose animée sous son globe, baobabs à arracher, volcans à ramoner ;
  2. système de dialogue (arbres JSON localisés, fenêtre, historique) ;
  3. journal de voyage (premières pensées notées en observant) ;
  4. première musique et déblocage audio à la première interaction ;
  5. **action utilisateur :** `npm run dev`, marcher (ZQSD/flèches), courir (Maj), orbiter (clic gauche), zoomer (molette), puis touche **2** : faire le tour de B-612 et vérifier la bascule d'horizon.

## Session du 10/06/2026 (1) — Jalon M0 : Socle technique

* **Objectif :** initialiser le projet et bâtir le socle moteur (critère de sortie : scène stylisée fluide, chaîne de qualité verte).
* **Travaux réalisés :**
  * documents de préproduction `Analyse_du_livre.md` et `Plan_initial.md` (validés) ;
  * projet Vite + TypeScript strict, ESLint/Prettier, arborescence conforme à `Architecture.md` ;
  * `GameLoop` (pas fixe 60 Hz, anti « spirale de la mort »), `TimeService` (échelle/pause), `EventBus` typé, `InputManager`, `CameraManager`, `AssetManager` (cache + GLTF/Draco), `RendererService` (WebGL2, pipeline de post-traitement), `SceneManager` + contrat `ISceneModule`, `Logger` 4 niveaux ;
  * prototype du rendu « aquarelle » : rampe toon à filtrage linéaire (lavis) + grain de papier animé + vignette + brume chaude ;
  * scène de test : dunes en aplats, planète suspendue (clin d'œil à B-612), 400 étoiles, dérive contemplative de caméra ;
  * 10 tests unitaires Vitest (EventBus, TimeService, RampeAquarelle), lint sans erreur, build de production OK (jeu : 22 ko gzip ; Three.js : chunk vendor séparé de 131 ko gzip).
* **Difficultés rencontrées :**
  * fichiers doublons résiduels dans le conteneur (nettoyés ; nomenclature unifiée sur `Architecture.md`) ;
  * `needsUpdate` est un setter pur dans Three.js → test ajusté sur `texture.version` ;
  * `noUncheckedIndexedAccess` impose des accès indexés sécurisés (uniforms) — contrainte conservée car elle protège tout le projet.
* **Décisions techniques :**
  * `EvenementsJeu` déclaré en `type` (signature d'index implicite requise par le bus typé) ;
  * Three.js isolé en chunk « vendor » via `manualChunks` (cache navigateur durable) ;
  * `RendererService` est l'unique module connaissant le moteur de rendu concret (bascule WebGPU au M7 sans impact ailleurs).
* **Prochaines étapes (jalon M1) :**
  1. contrôleur de personnage 3e personne (marche/course) + collisions simples ;
  2. terrain de dunes définitif (bruit cohérent) et caméra de suivi ;
  3. premiers réglages du contrôleur sur sphère (préparation gravité sphérique de B-612) ;
  4. **action utilisateur :** lancer `npm run dev` et confirmer 60 FPS + valider visuellement le style aquarelle (indicateur en haut à gauche).

---

# Règle de mise à jour

À la fin de chaque session de développement, mettre à jour ce document en :

1. changeant le statut des tâches concernées ;
2. ajustant les pourcentages de progression ;
3. ajoutant les nouvelles tâches découvertes ;
4. renseignant le journal de développement ;
5. identifiant les éventuels blocages.

Ce document constitue la référence officielle de l'état d'avancement du projet.
