import * as THREE from 'three';

/**
 * Libère récursivement toutes les ressources GPU d'une scène
 * (géométries, matériaux, fond). Utilisé par chaque module de scène
 * dans son cycle de vie « liberer() » (Architecture.md §10).
 */
export function libererScene(scene: THREE.Scene): void {
  scene.traverse((objet) => {
    if (objet instanceof THREE.Mesh || objet instanceof THREE.Points) {
      objet.geometry.dispose();
      const materiaux = Array.isArray(objet.material) ? objet.material : [objet.material];
      for (const materiau of materiaux) materiau.dispose();
    }
  });
  if (scene.background instanceof THREE.Texture) scene.background.dispose();
  scene.clear();
}
