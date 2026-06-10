import * as THREE from 'three';

/**
 * Crée une rampe de tons douce destinée à MeshToonMaterial.
 *
 * Choix artistique (prototype « aquarelle », risque n°1 du plan initial) :
 * contrairement au toon shading classique à bandes dures (NearestFilter),
 * nous utilisons un filtrage linéaire qui fond les paliers entre eux,
 * à la manière d'un lavis d'aquarelle. Le résultat conserve la simplicité
 * des aplats de Saint-Exupéry tout en restant doux et lumineux.
 *
 * @param paliers valeurs de luminance croissantes (0–255).
 */
export function creerRampeAquarelle(paliers: number[] = [96, 152, 208, 255]): THREE.DataTexture {
  const donnees = new Uint8Array(paliers);
  const texture = new THREE.DataTexture(donnees, paliers.length, 1, THREE.RedFormat);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}
