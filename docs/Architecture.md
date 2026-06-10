# Architecture du projet

**Projet :** Le Petit Prince – Une Aventure Interactive 3D

---

# 1. Objectif de cette architecture

Cette architecture définit l'organisation complète du projet afin de garantir :

* une excellente maintenabilité ;
* une forte modularité ;
* des performances élevées ;
* une grande facilité d'évolution ;
* un code propre et documenté.

Chaque système doit être indépendant autant que possible.

Aucun module ne doit devenir un "God Object".

---

# 2. Technologies retenues

## Langage

* TypeScript

## Moteur graphique

* Three.js (prioritaire)
* Babylon.js uniquement si un besoin technique le justifie

## Build

* Vite

## Rendu

* WebGL
* Compatibilité WebGPU lorsqu'elle est disponible

## Modèles

* GLTF / GLB
* Compression Draco

## Audio

* Web Audio API

## Interface

* HTML
* CSS
* TypeScript

---

# 3. Architecture générale

Le projet suit une architecture modulaire orientée composants.

Chaque système est responsable d'une seule fonction.

Les modules communiquent via des interfaces clairement définies.

Le couplage entre les systèmes doit rester minimal.

---

# 4. Arborescence cible

```text
Projet/

├── public/
│
├── src/
│   ├── core/
│   ├── engine/
│   ├── game/
│   ├── scenes/
│   ├── characters/
│   ├── planets/
│   ├── interactions/
│   ├── dialogues/
│   ├── ui/
│   ├── audio/
│   ├── shaders/
│   ├── physics/
│   ├── assets/
│   ├── loaders/
│   ├── animations/
│   ├── save/
│   ├── localization/
│   ├── utilities/
│   ├── configuration/
│   └── main.ts
│
├── docs/
├── tests/
├── package.json
├── vite.config.ts
└── README.md
```

---

# 5. Description des dossiers

## core/

Point d'entrée du moteur.

Responsabilités :

* initialisation ;
* boucle principale ;
* gestion des modules ;
* démarrage du jeu.

---

## engine/

Regroupe les services bas niveau :

* caméra ;
* rendu ;
* lumière ;
* temps ;
* événements ;
* ressources.

---

## game/

Contient les règles du jeu :

* progression ;
* objectifs ;
* états ;
* sauvegarde ;
* logique principale.

---

## scenes/

Chaque grande scène possède son propre dossier.

Exemple :

```text
scenes/

Desert/

B612/

Terre/

PlaneteRoi/

PlaneteVaniteux/

PlaneteBusinessman/

PlaneteBuveur/

PlaneteAllumeur/

PlaneteGeographe/
```

Chaque scène est indépendante.

---

## characters/

Un dossier par personnage.

Exemple :

```text
PetitPrince/

Renard/

Rose/

Serpent/

Aviateur/

Roi/

Businessman/

...
```

Chaque personnage contient :

* modèle ;
* animations ;
* dialogues ;
* IA ;
* interactions.

---

## dialogues/

Système complet de dialogue.

Il contient :

* arbres de dialogue ;
* localisation ;
* gestionnaire ;
* affichage ;
* historique.

---

## interactions/

Toutes les interactions du joueur.

Exemple :

* parler ;
* observer ;
* ramasser ;
* activer ;
* examiner.

---

## ui/

Toute l'interface.

Sous-modules :

* menu principal ;
* HUD ;
* journal ;
* paramètres ;
* sauvegarde ;
* carte.

---

## audio/

Gestion complète :

* musique ;
* bruitages ;
* ambiance ;
* spatialisation.

---

## assets/

Organisation stricte :

```text
assets/

models/

textures/

sounds/

music/

fonts/

videos/

icons/
```

---

## animations/

Gestion des animations.

Exemple :

* personnages ;
* caméra ;
* objets ;
* transitions.

---

## save/

Sauvegarde.

Contient :

* sérialisation ;
* chargement ;
* progression.

---

## localization/

Toutes les traductions.

La langue principale est le français.

Prévoir l'internationalisation.

---

## utilities/

Fonctions utilitaires réutilisables.

Aucune logique métier.

---

## configuration/

Paramètres globaux.

Exemple :

* qualité graphique ;
* commandes ;
* constantes.

---

# 6. Architecture logicielle

Le projet repose sur plusieurs gestionnaires spécialisés.

Exemple :

* GameManager
* SceneManager
* CameraManager
* AudioManager
* AssetManager
* SaveManager
* DialogueManager
* InteractionManager
* UIManager
* InputManager
* AnimationManager
* WeatherManager
* LightingManager
* LocalizationManager

Chaque gestionnaire possède une responsabilité unique.

---

# 7. Communication entre modules

Les modules ne doivent jamais accéder directement aux données internes des autres modules.

La communication se fait via :

* interfaces ;
* événements ;
* services ;
* injection de dépendances lorsque nécessaire.

---

# 8. Gestion des ressources

Toutes les ressources sont chargées par un AssetManager.

Fonctionnalités :

* chargement différé ;
* préchargement intelligent ;
* cache mémoire ;
* libération automatique.

---

# 9. Performances

Objectifs :

* 60 FPS sur une configuration moyenne ;
* temps de chargement minimal ;
* faible consommation mémoire.

Optimisations prévues :

* LOD ;
* Frustum Culling ;
* Occlusion Culling si pertinent ;
* Object Pooling ;
* Texture Compression ;
* Lazy Loading ;
* Instancing.

---

# 10. Gestion des scènes

Chaque planète est une scène indépendante.

Le changement de planète doit être :

* fluide ;
* asynchrone ;
* sans écran noir prolongé.

Les ressources inutilisées sont libérées automatiquement.

---

# 11. Gestion des personnages

Chaque personnage possède :

* un contrôleur ;
* une IA ;
* un système d'animation ;
* un système de dialogue ;
* un système d'interaction.

Tous les personnages héritent d'une classe de base commune.

---

# 12. Sauvegarde

La sauvegarde conserve :

* progression ;
* paramètres ;
* planète actuelle ;
* objets découverts ;
* dialogues terminés ;
* succès éventuels.

Le système doit être extensible.

---

# 13. Journalisation

Prévoir un système de journalisation.

Niveaux :

* Information
* Avertissement
* Erreur
* Débogage

Les journaux doivent faciliter le développement.

---

# 14. Tests

Prévoir :

* tests unitaires ;
* tests d'intégration ;
* tests fonctionnels ;
* tests de performances.

Toute nouvelle fonctionnalité importante doit être accompagnée de tests.

---

# 15. Documentation

Chaque module doit être documenté.

Toute décision technique importante doit être expliquée.

Le projet doit rester compréhensible plusieurs mois après sa création.

---

# 16. Règles de développement

Tous les nouveaux développements doivent respecter les principes suivants :

* responsabilité unique (SRP) ;
* séparation des préoccupations ;
* code réutilisable ;
* faible couplage ;
* forte cohésion ;
* simplicité (KISS) ;
* éviter la duplication (DRY) ;
* privilégier la composition à l'héritage lorsque pertinent.

---

# 17. Évolutivité

L'architecture doit permettre d'ajouter facilement :

* de nouvelles planètes ;
* de nouveaux personnages ;
* de nouvelles langues ;
* de nouveaux dialogues ;
* des quêtes secondaires ;
* un mode photo ;
* un mode VR ou WebXR ;
* de nouvelles interactions sans refactorisation majeure.

---

# 18. Objectif final

Cette architecture doit permettre de construire un jeu stable, performant, facilement maintenable et fidèle à l'univers du *Petit Prince*.

Toute évolution du projet devra respecter cette architecture. Si une modification est nécessaire, elle devra être documentée et justifiée avant son implémentation.
