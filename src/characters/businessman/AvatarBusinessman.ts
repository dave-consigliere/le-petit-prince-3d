import * as THREE from 'three';
import { creerRampeAquarelle } from '../../shaders/RampeAquarelle';

/** Le Businessman — penché sur ses papiers, chiffres à n'en plus finir. */
export class AvatarBusinessman {
  readonly groupe = new THREE.Group();
  private tempsLocal = 0;

  constructor() {
    const rampe = creerRampeAquarelle();
    const matCostume = new THREE.MeshToonMaterial({ color: 0x4a4a5a, gradientMap: rampe });
    const matPeau = new THREE.MeshToonMaterial({ color: 0xe8c898, gradientMap: rampe });
    const matPapier = new THREE.MeshToonMaterial({ color: 0xf8f0d8, gradientMap: rampe });

    const corps = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.25, 0.68, 10), matCostume);
    corps.position.y = 0.44;
    corps.rotation.x = 0.25;
    const tete = new THREE.Mesh(new THREE.SphereGeometry(0.21, 14, 10), matPeau);
    tete.position.set(0, 0.95, 0.18);
    tete.rotation.x = 0.35;

    const bureau = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.6), matCostume);
    bureau.position.set(0, 0.38, 0.28);
    for (let i = 0; i < 3; i++) {
      const papier = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.015, 0.26), matPapier);
      papier.position.set(-0.1 + i * 0.06, 0.42 + i * 0.016, 0.28 + i * 0.03);
      papier.rotation.y = (i - 1) * 0.15;
      this.groupe.add(papier);
    }
    const cigare = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.18, 6),
      new THREE.MeshToonMaterial({ color: 0x8a6a4a, gradientMap: rampe }),
    );
    cigare.position.set(0.22, 1.0, 0.28);
    cigare.rotation.z = 0.5;
    this.groupe.add(corps, tete, bureau, cigare);
  }

  animer(dt: number): void {
    this.tempsLocal += dt;
    this.groupe.rotation.y = Math.sin(this.tempsLocal * 0.4) * 0.05;
  }
}
