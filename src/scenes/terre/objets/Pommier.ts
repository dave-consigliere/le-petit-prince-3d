import * as THREE from 'three';
import { creerRampeAquarelle } from '../../../shaders/RampeAquarelle';
import { CONFIG } from '../../../configuration/Config';

/**
 * Le pommier — « Je suis là, dit la voix, sous le pommier » (chap. XXI).
 * Lieu de la première rencontre avec le Renard.
 */
export class Pommier {
  readonly groupe = new THREE.Group();
  private tempsLocal = 0;
  private feuillage: THREE.Mesh;

  constructor() {
    const rampe = creerRampeAquarelle();
    const matTronc = new THREE.MeshToonMaterial({ color: 0x5a3a1a, gradientMap: rampe });
    const matFeuilles = new THREE.MeshToonMaterial({
      color: CONFIG.PALETTE_TERRE.pommier,
      gradientMap: rampe,
    });
    const matPomme = new THREE.MeshToonMaterial({ color: 0xc83020, gradientMap: rampe });

    // Tronc
    const tronc = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.22, 1.8, 10), matTronc);
    tronc.position.y = 0.9;

    // Feuillage : nuage de sphères
    this.feuillage = new THREE.Mesh(new THREE.SphereGeometry(1.0, 16, 12), matFeuilles);
    this.feuillage.position.y = 2.2;
    this.feuillage.scale.set(1.2, 0.9, 1.2);

    // Quelques sphères additionnelles pour un feuillage plus dense
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const r = 0.5;
      const grappe = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 10), matFeuilles);
      grappe.position.set(Math.cos(angle) * r, 2.0 + Math.random() * 0.3, Math.sin(angle) * r);
      this.groupe.add(grappe);
    }

    // Quelques pommes
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.7 + Math.random() * 0.3;
      const pomme = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), matPomme);
      pomme.position.set(Math.cos(angle) * r, 1.7 + Math.random() * 0.6, Math.sin(angle) * r);
      this.groupe.add(pomme);
    }

    this.groupe.add(tronc, this.feuillage);
  }

  animer(dt: number): void {
    this.tempsLocal += dt;
    // Léger frémissement du feuillage
    this.feuillage.rotation.y = Math.sin(this.tempsLocal * 0.4) * 0.03;
  }
}
