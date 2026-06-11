import * as THREE from 'three';
import { creerRampeAquarelle } from '../../shaders/RampeAquarelle';

/** Le Roi — manteau d'hermine envahissant, couronne, sceptre. */
export class AvatarRoi {
  readonly groupe = new THREE.Group();
  private tempsLocal = 0;

  constructor() {
    const rampe = creerRampeAquarelle();
    const matManteau = new THREE.MeshToonMaterial({ color: 0x7a3a8a, gradientMap: rampe });
    const matHermine = new THREE.MeshToonMaterial({ color: 0xf5f0e8, gradientMap: rampe });
    const matOr = new THREE.MeshToonMaterial({ color: 0xd4a820, gradientMap: rampe });
    const matPeau = new THREE.MeshToonMaterial({ color: 0xf0d0a8, gradientMap: rampe });

    const manteau = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.4, 1.0, 14), matManteau);
    manteau.position.y = 0.5;
    const hermine = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.18, 8, 24), matHermine);
    hermine.rotation.x = Math.PI / 2;
    hermine.position.y = 0.02;
    const corps = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.65, 10), matManteau);
    corps.position.y = 1.15;
    const tete = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), matPeau);
    tete.position.y = 1.62;
    const couronne = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.045, 6, 12), matOr);
    couronne.position.y = 1.86;
    for (let i = 0; i < 5; i++) {
      const pointe = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 5), matOr);
      const a = (i / 5) * Math.PI * 2;
      pointe.position.set(Math.cos(a) * 0.16, 1.92, Math.sin(a) * 0.16);
      this.groupe.add(pointe);
    }
    const sceptre = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.1, 6), matOr);
    sceptre.position.set(0.55, 0.85, 0.1);
    sceptre.rotation.z = -0.15;
    const boule = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), matOr);
    boule.position.set(0.63, 1.42, 0.1);
    this.groupe.add(manteau, hermine, corps, tete, couronne, sceptre, boule);
  }

  animer(dt: number): void {
    this.tempsLocal += dt;
    this.groupe.rotation.y = Math.sin(this.tempsLocal * 0.3) * 0.08;
  }
}
