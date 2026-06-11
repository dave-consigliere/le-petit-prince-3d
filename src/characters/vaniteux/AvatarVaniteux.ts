import * as THREE from 'three';
import { creerRampeAquarelle } from '../../shaders/RampeAquarelle';

/** Le Vaniteux — grand chapeau haut-de-forme, salut mécanique. */
export class AvatarVaniteux {
  readonly groupe = new THREE.Group();
  readonly chapeau = new THREE.Group();
  private tempsLocal = 0;
  private salutEnCours = false;
  private dureeSalut = 0;

  constructor() {
    const rampe = creerRampeAquarelle();
    const matHabit = new THREE.MeshToonMaterial({ color: 0xc8a030, gradientMap: rampe });
    const matPeau = new THREE.MeshToonMaterial({ color: 0xf0d0a8, gradientMap: rampe });
    const matOr = new THREE.MeshToonMaterial({ color: 0xd4a820, gradientMap: rampe });

    const corps = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.24, 0.7, 10), matHabit);
    corps.position.y = 0.45;
    const tete = new THREE.Mesh(new THREE.SphereGeometry(0.21, 14, 10), matPeau);
    tete.position.y = 1.0;
    this.chapeau.position.y = 1.0;
    const bord = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.04, 18), matOr);
    bord.position.y = 0.25;
    const cylindre = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.45, 14), matOr);
    cylindre.position.y = 0.47;
    this.chapeau.add(bord, cylindre);
    const jambeG = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.6, 8), matHabit);
    jambeG.position.set(-0.12, -0.2, 0);
    const jambeD = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.6, 8), matHabit);
    jambeD.position.set(0.12, -0.2, 0);
    this.groupe.add(corps, tete, this.chapeau, jambeG, jambeD);
  }

  saluer(): void {
    this.salutEnCours = true;
    this.dureeSalut = 0;
  }

  animer(dt: number): void {
    this.tempsLocal += dt;
    if (this.salutEnCours) {
      this.dureeSalut += dt;
      this.chapeau.position.y = 1.0 + Math.sin(Math.min(this.dureeSalut * 3, Math.PI)) * 0.4;
      if (this.dureeSalut > 1.2) {
        this.salutEnCours = false;
        this.chapeau.position.y = 1.0;
      }
    }
    this.groupe.rotation.y = Math.sin(this.tempsLocal * 0.5) * 0.1;
  }
}
