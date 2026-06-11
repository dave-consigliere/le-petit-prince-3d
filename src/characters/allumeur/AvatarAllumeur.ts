import * as THREE from 'three';
import { creerRampeAquarelle } from '../../shaders/RampeAquarelle';

/** L'Allumeur — fidèle à la consigne, réverbère qui clignote. */
export class AvatarAllumeur {
  readonly groupe = new THREE.Group();
  readonly reverbere: THREE.PointLight;
  private tempsLocal = 0;

  constructor() {
    const rampe = creerRampeAquarelle();
    const matHabit = new THREE.MeshToonMaterial({ color: 0x3a4a5a, gradientMap: rampe });
    const matPeau = new THREE.MeshToonMaterial({ color: 0xe8c898, gradientMap: rampe });
    const matMetal = new THREE.MeshToonMaterial({ color: 0x8a8a7a, gradientMap: rampe });
    const matVerre = new THREE.MeshToonMaterial({
      color: 0xffe8a0,
      gradientMap: rampe,
      transparent: true,
      opacity: 0.8,
    });

    const corps = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.22, 0.68, 10), matHabit);
    corps.position.y = 0.44;
    const tete = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), matPeau);
    tete.position.y = 0.99;
    const poteau = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 1.4, 8), matMetal);
    poteau.position.set(0.55, 0.7, 0);
    const lanterne = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 0.2), matVerre);
    lanterne.position.set(0.55, 1.42, 0);
    const chapLanterne = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.12, 8), matMetal);
    chapLanterne.position.set(0.55, 1.56, 0);
    this.reverbere = new THREE.PointLight(0xffe8a0, 0, 3.5);
    this.reverbere.position.set(0.55, 1.42, 0);
    const perche = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.9, 6), matMetal);
    perche.position.set(-0.3, 0.65, 0.1);
    perche.rotation.z = 0.4;
    this.groupe.add(corps, tete, poteau, lanterne, chapLanterne, this.reverbere, perche);
  }

  animer(dt: number): void {
    this.tempsLocal += dt;
    const phase = (this.tempsLocal % 4) / 4;
    this.reverbere.intensity = phase < 0.5 ? 1.2 : 0;
    this.groupe.rotation.y = Math.sin(this.tempsLocal * 0.6) * 0.06;
  }
}
