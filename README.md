# Le Petit Prince – Une Aventure Interactive 3D

Adaptation interactive et contemplative du *Petit Prince* d'Antoine de Saint-Exupéry,
jouable directement dans un navigateur moderne.

## Démarrage rapide

```bash
npm install      # installe les dépendances
npm run dev      # serveur de développement (http://localhost:5173)
npm run build    # vérification des types + build de production (dist/)
npm test         # tests unitaires (Vitest)
npm run lint     # analyse statique (ESLint)
```

## État du projet

**Jalon M0 — Socle technique** : boucle de jeu à pas fixe, services moteur
(rendu, caméra, entrées, ressources, temps, événements), gestionnaire de scènes
et scène de test « première aquarelle » (dunes en aplats doux, planète suspendue,
étoiles, grain de papier).

## Documentation

* `docs/Vision_du_projet.md` — vision et objectifs
* `docs/Architecture.md` — architecture logicielle de référence
* `docs/Assets.md` — suivi des ressources
* `docs/Analyse_du_livre.md` — analyse canonique de l'œuvre
* `docs/Plan_initial.md` — choix techniques et feuille de route
* `TODO.md` — état d'avancement officiel

## Principes

Architecture modulaire (un gestionnaire = une responsabilité), TypeScript strict,
communication par événements typés, performances visées : 60 FPS sur machine
de milieu de gamme. Tous les commentaires et la documentation sont en français.
