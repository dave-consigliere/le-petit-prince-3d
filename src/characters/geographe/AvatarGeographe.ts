import * as THREE from 'three';
import { creerRampeAquarelle } from '../../shaders/RampeAquarelle';

/** Le Géographe — imposant, derrière une pile de livres énormes. */
export class AvatarGeographe {
  readonly groupe = new THREE.Group();
  private tempsLocal = 0;

  constructor() {
    const rampe = creerRampeAquarelle();
    const matRobe = new THREE.MeshToonMaterial({ color: 0x7a5a3a, gradientMap: rampe });
    const matPeau = new THREE.MeshToonMaterial({ color: 0xe8c898, gradientMap: rampe });
    const matLivre = new THREE.MeshToonMaterial({ color: 0x4a3a2a, gradientMap: rampe });
    const matPages = new THREE.MeshToonMaterial({ color: 0xf8f0d8, gradientMap: rampe });

    const corps = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.78, 12), matRobe);
    corps.position.y = 0.49;
    const tete = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 10), matPeau);
    tete.position.y = 1.1;
    const barbe = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.28, 10), matPeau);
    barbe.position.set(0, 0.88, 0.1);
    barbe.rotation.x = -0.3;

    [
      [0.22, 0.55, 0.38, 0.11, 0],
      [0.2, 0.5, 0.35, 0.33, 0.08],
      [0.18, 0.45, 0.32, 0.53, -0.06],
    ].forEach(([h, w, d, y, rot]) => {
      const couv = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), matLivre);
      couv.position.set(0.55, y ?? 0, 0.1);
      couv.rotation.y = rot ?? 0;
      const pages = new THREE.Mesh(
        new THREE.BoxGeometry((w ?? 0) - 0.04, (h ?? 0) - 0.02, (d ?? 0) - 0.04),
        matPages,
      );
      pages.position.set(0.55, y ?? 0, 0.1);
      pages.rotation.y = rot ?? 0;
      this.groupe.add(couv, pages);
    });

    const crayon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.25, 6),
      new THREE.MeshToonMaterial({ color: 0xe8c030, gradientMap: rampe }),
    );
    crayon.position.set(0.28, 0.85, 0.3);
    crayon.rotation.z = 0.6;
    crayon.rotation.x = 0.3;
    this.groupe.add(corps, tete, barbe, crayon);
  }

  animer(dt: number): void {
    this.tempsLocal += dt;
    this.groupe.rotation.y = Math.sin(this.tempsLocal * 0.4) * 0.05;
  }
}
