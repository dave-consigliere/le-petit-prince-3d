import * as THREE from 'three';
import { creerRampeAquarelle } from '../../shaders/RampeAquarelle';

/**
 * Avatar de l'Aviateur (PNJ du hub Désert).
 * Silhouette d'adulte, combinaison de vol beige, foulard brun.
 * Il reste près de l'avion, penché sur son moteur — attitude canonique.
 */
export class AvatarAviateur {
  readonly groupe = new THREE.Group();
  private tempsLocal = 0;
  private readonly corpsAnime = new THREE.Group();

  constructor() {
    const rampe = creerRampeAquarelle();
    const matCombi = new THREE.MeshToonMaterial({ color: 0xc8b07a, gradientMap: rampe });
    const matPeau = new THREE.MeshToonMaterial({ color: 0xe8c89a, gradientMap: rampe });
    const matFoulard = new THREE.MeshToonMaterial({ color: 0x8a5a3a, gradientMap: rampe });
    const matCheveux = new THREE.MeshToonMaterial({ color: 0x4a3828, gradientMap: rampe });

    // Corps (légèrement plus grand que le Prince)
    const corps = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.72, 12), matCombi);
    corps.position.y = 0.46;

    const tete = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), matPeau);
    tete.position.y = 1.06;

    const cheveux = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), matCheveux);
    cheveux.scale.set(1, 0.75, 1);
    cheveux.position.y = 1.14;

    // Foulard
    const foulard = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.055, 8, 16), matFoulard);
    foulard.rotation.x = Math.PI / 2;
    foulard.position.y = 0.82;

    // Bras (légèrement baissés — il travaille sur le moteur)
    const geoBras = new THREE.CylinderGeometry(0.07, 0.06, 0.56, 8);
    const brasG = new THREE.Mesh(geoBras, matCombi);
    brasG.position.set(-0.34, 0.52, 0.1);
    brasG.rotation.z = -0.7;
    brasG.rotation.x = 0.4;
    const brasD = new THREE.Mesh(geoBras, matCombi);
    brasD.position.set(0.34, 0.52, 0.1);
    brasD.rotation.z = 0.7;
    brasD.rotation.x = 0.4;

    // Jambes
    const geoJambe = new THREE.CylinderGeometry(0.1, 0.09, 0.62, 8);
    const jambeG = new THREE.Mesh(geoJambe, matCombi);
    jambeG.position.set(-0.14, -0.21, 0);
    const jambeD = new THREE.Mesh(geoJambe, matCombi);
    jambeD.position.set(0.14, -0.21, 0);

    this.corpsAnime.add(corps, tete, cheveux, foulard, brasG, brasD, jambeG, jambeD);
    this.groupe.add(this.corpsAnime);
  }

  /** Légère respiration et balancement de tête (il réfléchit à sa panne). */
  animer(dt: number): void {
    this.tempsLocal += dt;
    const respiration = 1 + Math.sin(this.tempsLocal * 1.8) * 0.008;
    this.corpsAnime.scale.set(1, respiration, 1);
    this.corpsAnime.rotation.y = Math.sin(this.tempsLocal * 0.4) * 0.06;
  }
}
