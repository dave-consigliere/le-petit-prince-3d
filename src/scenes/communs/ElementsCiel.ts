import * as THREE from 'three';

/**
 * Éléments de ciel partagés entre les scènes (dégradé peint, étoiles).
 * Factorise ce qui était prototypé dans la scène de test du jalon M0.
 */

/** Dégradé vertical peint sur un canvas, utilisé comme fond plein écran. */
export function creerFondDegrade(couleurHaut: string, couleurBas: string): THREE.Texture | null {
  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 256;
  const contexte = canvas.getContext('2d');
  if (!contexte) return null;

  const degrade = contexte.createLinearGradient(0, 0, 0, canvas.height);
  degrade.addColorStop(0, couleurHaut);
  degrade.addColorStop(1, couleurBas);
  contexte.fillStyle = degrade;
  contexte.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export interface OptionsEtoiles {
  nombre: number;
  rayon: number;
  /** Hauteur minimale au-dessus de l'horizon (0 = ciel complet). */
  hauteurMinimale: number;
  taille: number;
  opacite: number;
}

/** Champ d'étoiles en points instanciés (un seul appel de rendu). */
export function creerEtoiles(options: OptionsEtoiles): THREE.Points {
  const positions = new Float32Array(options.nombre * 3);
  for (let i = 0; i < options.nombre; i++) {
    // Distribution uniforme sur la sphère, repliée au-dessus de l'horizon
    // si une hauteur minimale est demandée.
    const angle = Math.random() * Math.PI * 2;
    const cosinus = Math.random() * 2 - 1;
    const sinus = Math.sqrt(1 - cosinus * cosinus);
    let y = options.rayon * cosinus;
    if (options.hauteurMinimale > 0) y = Math.abs(y) + options.hauteurMinimale;
    positions[i * 3] = options.rayon * sinus * Math.cos(angle);
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = options.rayon * sinus * Math.sin(angle);
  }
  const geometrie = new THREE.BufferGeometry();
  geometrie.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const materiau = new THREE.PointsMaterial({
    color: 0xfff8e7,
    size: options.taille,
    sizeAttenuation: true,
    transparent: true,
    opacity: options.opacite,
    fog: false, // les étoiles ne doivent jamais être mangées par la brume
  });
  return new THREE.Points(geometrie, materiau);
}
