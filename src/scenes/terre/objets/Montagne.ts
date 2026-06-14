import * as THREE from 'three';
import { creerRampeAquarelle } from '../../../shaders/RampeAquarelle';
import { CONFIG } from '../../../configuration/Config';

/**
 * Les montagnes aiguës (chap. XIX) — « aiguilles de roc bien aiguisées »,
 * lieu de l'écho. Cônes pointus en groupe.
 */
export class Montagne {
  readonly groupe = new THREE.Group();

  constructor() {
    const rampe = creerRampeAquarelle();
    const matRoche = new THREE.MeshToonMaterial({
      color: CONFIG.PALETTE_TERRE.montagne,
      gradientMap: rampe,
    });
    const matPointe = new THREE.MeshToonMaterial({
      color: CONFIG.PALETTE_TERRE.montagnePointe,
      gradientMap: rampe,
    });

    // Plusieurs aiguilles regroupées
    const positions = [
      { x: 0, z: 0, h: 5.5, r: 1.1 },
      { x: 2.0, z: 0.5, h: 4.2, r: 0.9 },
      { x: -1.8, z: 0.3, h: 4.8, r: 1.0 },
      { x: 0.5, z: -1.5, h: 3.8, r: 0.8 },
      { x: -1.2, z: -1.2, h: 3.5, r: 0.75 },
    ];

    for (const p of positions) {
      // Base sombre
      const base = new THREE.Mesh(new THREE.ConeGeometry(p.r, p.h, 7), matRoche);
      base.position.set(p.x, p.h / 2, p.z);
      base.rotation.y = Math.random() * Math.PI;
      this.groupe.add(base);

      // Pointe claire
      const pointe = new THREE.Mesh(new THREE.ConeGeometry(p.r * 0.4, p.h * 0.35, 7), matPointe);
      pointe.position.set(p.x, p.h - p.h * 0.175, p.z);
      pointe.rotation.y = base.rotation.y;
      this.groupe.add(pointe);
    }
  }
}
