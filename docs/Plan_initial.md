# Plan initial de développement

**Projet :** Le Petit Prince – Une Aventure Interactive 3D
**Statut :** Proposé pour validation — aucune ligne de code de production avant accord.
**Documents liés :** `Vision_du_projet.md`, `Architecture.md`, `Assets.md`, `TODO.md`, `Analyse_du_livre.md`

---

# 1. Synthèse des décisions techniques

| Domaine | Décision | Justification |
|---|---|---|
| Langage | **TypeScript strict** (`strict: true`, `noUncheckedIndexedAccess`) | Robustesse, refactorisations sûres, documentation par les types |
| Moteur 3D | **Three.js** (r16x) | Conforme à `Architecture.md` ; écosystème mature, contrôle fin du pipeline de rendu stylisé, poids inférieur à Babylon pour notre besoin (pas de physique lourde, pas d'éditeur) |
| Rendu | **WebGL2** par défaut, **WebGPU** opportuniste via `WebGPURenderer` derrière une abstraction `RendererService` | Compatibilité maximale (Safari inclus) + avenir assuré sans dette |
| Build | **Vite** | Démarrage instantané, découpage en chunks par scène (lazy loading naturel via `import()`) |
| Modèles | **glTF/GLB + Draco** ; instancing pour blé/roses/étoiles | Standard Web, compression efficace |
| Textures | **KTX2/Basis** (UASTC pour les aquarelles, ETC1S pour le reste) | Mémoire GPU réduite, chargement rapide |
| Audio | **Web Audio API** via un `AudioManager` (bus musique / ambiance / SFX / UI, spatialisation `PannerNode`) | Contrôle total, crossfades, silence narratif |
| État de jeu | Machine à états finis + **EventBus** typé (pattern observateur) | Découplage exigé par `Architecture.md` §7 |
| Sauvegarde | `localStorage` + export/import JSON, schéma versionné | Simple, hors-ligne, extensible |
| Tests | **Vitest** (unitaires/intégration), **Playwright** (fonctionnels), budgets de perfs scriptés | Pyramide de tests adaptée au Web |
| Qualité | ESLint + Prettier + TypeDoc + CI (lint → tests → build) | Standards professionnels |

**Pourquoi pas Babylon.js ?** Babylon apporte un moteur « tout intégré » (physique, GUI, inspecteur) dont nous n'avons pas besoin : notre différenciation est un **rendu aquarelle sur mesure**, plus simple à construire avec les `ShaderMaterial`/`NodeMaterial` et la communauté d'exemples de Three.js. Décision réversible : le moteur est isolé derrière `engine/`.

---

# 2. Pipeline graphique « aquarelle »

Objectif : évoquer les aquarelles de Saint-Exupéry **sans photoréalisme**.

1. **Matériaux** : `MeshToonMaterial` étendu (gradient map 3–4 paliers doux) ou shader personnalisé « rampe peinte » ; couleurs désaturées-chaudes, pas de speculaire dur.
2. **Contours** : pas d'outline noir agressif — léger « bord humide » (rim light teintée) fidèle au trait de plume discret des illustrations.
3. **Papier** : post-process final = grain de papier subtil (texture overlay à ~4 %), vignette douce, **bloom faible**, brouillard coloré par scène (`FogExp2` teinté).
4. **Ciels** : dégradés peints (skybox procédurale 2 couleurs + étoiles instanciées scintillantes), couchers de soleil = simple interpolation de palette (cohérent avec « tirer sa chaise »).
5. **Végétation/foule d'objets** : `InstancedMesh` (5 000 roses, champs de blé ondulant par shader de vertex).
6. **LOD & culling** : LOD sur personnages/props, frustum culling natif, scènes-planètes minuscules = budgets triangles très bas par conception.

Budgets : ≤ 150 k triangles affichés / scène, ≤ 80 Mo de VRAM textures, 60 FPS sur GPU intégré récent.

---

# 3. Architecture d'exécution (rappel + précisions)

Conforme à `Architecture.md`. Précisions d'implémentation :

```text
core/      → Bootstrap, GameLoop (update fixe + rendu variable), ModuleRegistry
engine/    → RendererService (WebGL2/WebGPU), CameraManager, TimeService,
             EventBus<Events> typé, AssetManager (cache + libération par scène)
game/      → GameStateMachine (Titre → Hub → Souvenir(x) → Épilogue),
             ProgressionService (8 jours narratifs), SaveManager (schéma v1)
scenes/    → 1 module lazy par scène ; contrat commun ISceneModule
             { charger(), demarrer(), mettreAJour(dt), liberer() }
characters/→ ClasseDeBase Personnage (modèle, animateur, IA, dialogues),
             composition de comportements (Approche, Regard, Errance)
dialogues/ → Arbres JSON localisés (fr par défaut), DialogueManager,
             affichage machine-à-écrire, historique dans le Journal
ui/        → DOM/CSS par-dessus le canvas (accessibilité native :
             navigation clavier, tailles de texte, contraste)
```

Règles : aucune dépendance circulaire ; toute communication inter-modules passe par l'EventBus ou des interfaces injectées.

---

# 4. Boucle de jeu et structure narrative

* **Hub** : le désert au présent (Aviateur + avion). Chaque « jour » débloque un ou plusieurs souvenirs.
* **Souvenirs jouables** : B-612 (Rose, baobabs, volcans, couchers de soleil) → 6 planètes → arrivée sur Terre (Serpent, écho, jardin, Renard).
* **Mécaniques contemplatives** :
  * *S'asseoir / observer* : révèle des pensées du Prince dans le journal ;
  * *Apprivoiser le Renard* : approche graduelle sur plusieurs visites, à heure fixe (rite) ;
  * *Entretenir B-612* : arroser la Rose, ramoner les volcans, arracher les baobabs ;
  * *Voyager* : carte des planètes poétique (migration d'oiseaux comme transition).
* **Fin** : nuit du serpent traitée en ellipse lumineuse, épilogue sous les étoiles, invitation à relire le livre.

---

# 5. Feuille de route (jalons)

| Jalon | Contenu | Critère de sortie |
|---|---|---|
| **M0 — Socle** | Vite + TS strict + ESLint/Prettier + Git ; GameLoop, RendererService, InputManager, CameraManager, AssetManager, EventBus ; scène de test | Cube stylisé à 60 FPS, CI verte |
| **M1 — Joueur & Désert gris-box** | Contrôleur 3e personne, collisions simples, terrain de dunes, cycle lumière | Déplacement agréable validé |
| **M2 — Verticale B-612** | B-612 complet (Rose, volcans, baobabs), système de dialogue, journal, 1re musique | Tranche verticale jouable = preuve du concept |
| **M3 — Hub Désert** | Aviateur, avion, puits, progression 8 jours, sauvegarde | Boucle hub→souvenir→hub fonctionnelle |
| **M4 — Les six planètes** | Roi, Vaniteux, Buveur, Businessman, Allumeur, Géographe | Chaque vignette jouable et fidèle |
| **M5 — La Terre** | Serpent, montagnes/écho, jardin de roses, champs de blé, **Renard complet** | Mécanique d'apprivoisement validée |
| **M6 — Fin & UI complète** | Chapitres finaux, menus, paramètres, accessibilité, localisation | Jeu finissable de bout en bout |
| **M7 — Polissage** | Audio complet, VFX, optimisation (Draco/KTX2/LOD), tests Playwright | Budgets de perfs tenus sur 4 navigateurs |
| **M8 — Livraison** | Nettoyage, licences, documentation, build de production | Critères de `Vision_du_projet.md` §18 atteints |

---

# 6. Stratégie de tests

* **Unitaires (Vitest)** : SaveManager (sérialisation/versions), DialogueManager (parcours d'arbres), ProgressionService, EventBus, utilitaires math.
* **Intégration** : chargement/libération de scène (fuites mémoire), transitions d'états.
* **Fonctionnels (Playwright)** : parcours critique « nouvelle partie → B-612 → sauvegarde → rechargement », navigation clavier des menus.
* **Performances** : script de mesure FPS/heap par scène, seuils en CI (échec si < 50 FPS sur la machine de référence).
* **Compatibilité** : Chrome, Edge, Firefox, Safari (WebGL2 partout ; WebGPU vérifié sur Chrome/Edge).

---

# 7. Droit d'auteur et contenu

* Dialogues : **réécritures originales** dans le style de l'œuvre ; aucune citation longue.
* Assets externes : licences vérifiées et consignées dans `Assets.md` §16 ; style retravaillé pour l'homogénéité aquarelle.
* Musiques : compositions originales ou licences libres compatibles.

---

# 8. Risques identifiés

| Risque | Impact | Mitigation |
|---|---|---|
| Rendu aquarelle décevant | Élevé (cœur de l'identité) | Prototyper le shader dès M0/M2 ; itérer sur la rampe et le grain |
| Marche sur micro-planètes (gravité sphérique) | Moyen | Contrôleur orienté « surface » dès M1 ; B-612 = sphère test |
| Safari/WebGL2 (KTX2, audio autoplay) | Moyen | Fallbacks testés tôt ; déblocage audio sur première interaction |
| Dérive de périmètre | Moyen | Toute idée passe le filtre de `Vision_du_projet.md` §19 |

---

# 9. Prochaine étape proposée

Après validation de ce plan : **M0 — Socle technique** (initialisation Vite/TypeScript, structure des dossiers conforme à `Architecture.md`, GameLoop, RendererService et scène de test stylisée), avec mise à jour de `TODO.md` en fin de session.
