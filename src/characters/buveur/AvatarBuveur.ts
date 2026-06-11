import * as THREE from 'three';
import { creerRampeAquarelle } from '../../shaders/RampeAquarelle';

/** Le Buveur — mélancolique, entouré de bouteilles. */
export class AvatarBuveur {
  readonly groupe = new THREE.Group();
  private tempsLocal = 0;

  constructor() {
    const rampe = creerRampeAquarelle();
    const matHabit = new THREE.MeshToonMaterial({ color: 0x5a6a7a, gradientMap: rampe });
    const matPeau = new THREE.MeshToonMaterial({ color: 0xd0b898, gradientMap: rampe });
    const matVerre = new THREE.MeshToonMaterial({
      color: 0x88b0c8,
      gradientMap: rampe,
      transparent: true,
      opacity: 0.7,
    });
    const matBout = new THREE.MeshToonMaterial({
      color: 0x4a6a4a,
      gradientMap: rampe,
      transparent: true,
      opacity: 0.85,
    });

    const corps = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.65, 10), matHabit);
    corps.position.y = 0.42;
    corps.rotation.z = 0.18;
    const tete = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), matPeau);
    tete.position.set(0.08, 0.88, 0);
    tete.rotation.z = 0.22;

    const geoBout = new THREE.CylinderGeometry(0.055, 0.07, 0.38, 8);
    [
      [-0.5, 0, -0.3],
      [0.55, 0, 0.2],
      [-0.35, 0, 0.45],
      [0.4, 0, -0.45],
    ].forEach(([x, _y, z], i) => {
      const b = new THREE.Mesh(geoBout, i % 2 === 0 ? matBout : matVerre);
      b.position.set(x ?? 0, 0.19, z ?? 0);
      b.rotation.z = (i - 1.5) * 0.15;
      this.groupe.add(b);
    });

    const verre = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.12, 8), matVerre);
    verre.position.set(0.3, 0.62, 0.1);
    this.groupe.add(corps, tete, verre);
  }

  animer(dt: number): void {
    this.tempsLocal += dt;
    this.groupe.position.y = Math.sin(this.tempsLocal * 1.2) * 0.015;
  }
}
