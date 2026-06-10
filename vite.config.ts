import { defineConfig } from 'vitest/config';

/**
 * Configuration Vite du projet.
 * - cible ES2022 (navigateurs modernes uniquement, cf. Vision_du_projet.md §4) ;
 * - sourcemaps activées pour faciliter le débogage en production de test ;
 * - Vitest configuré en environnement Node (les services testés sont sans DOM).
 */
export default defineConfig({
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Three.js dans un chunk séparé : mis en cache une fois pour toutes
        // par le navigateur, il ne sera pas retéléchargé à chaque mise à jour du jeu.
        manualChunks: { three: ['three'] },
      },
    },
  },
  test: {
    environment: 'node',
  },
});
