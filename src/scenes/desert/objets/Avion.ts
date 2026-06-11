import * as THREE from 'three';
import { creerRampeAquarelle } from '../../../shaders/RampeAquarelle';

/**
 * L'avion accidenté de l'Aviateur.
 * Silhouette stylisée : fuselage cylindrique, ailes delta, hélice.
 * Posé dans le sable, légèrement incliné — « quelque chose s'était cassé
 * dans mon moteur » (chap. II).
 */
export class Avion {
  readonly groupe = new THREE.Group();

  constructor() {
    const rampe = creerRampeAquarelle();
    const matMetal = new THREE.MeshToonMaterial({ color: 0xc8b89a, gradientMap: rampe });
    const matDark = new THREE.MeshToonMaterial({ color: 0x8a7a6a, gradientMap: rampe });
    const matHelice = new THREE.MeshToonMaterial({ color: 0x5a4a3a, gradientMap: rampe });

    // Fuselage
    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.18, 3.2, 10), matMetal);
    fuselage.rotation.z = Math.PI / 2;
    fuselage.position.set(0, 0.55, 0);

    // Nez arrondi
    const nez = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), matMetal);
    nez.scale.set(1.2, 1, 1);
    nez.position.set(1.6, 0.55, 0);

    // Cockpit
    const cockpit = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 10, 8),
      new THREE.MeshToonMaterial({
        color: 0x7ab0c8,
        gradientMap: rampe,
        transparent: true,
        opacity: 0.7,
      }),
    );
    cockpit.scale.set(0.9, 0.7, 0.8);
    cockpit.position.set(0.3, 0.88, 0);

    // Ailes
    const geoAile = new THREE.BoxGeometry(1.8, 0.08, 0.7);
    const aileG = new THREE.Mesh(geoAile, matMetal);
    aileG.position.set(-0.1, 0.5, 1.05);
    const aileD = new THREE.Mesh(geoAile, matMetal);
    aileD.position.set(-0.1, 0.5, -1.05);

    // Empennage
    const geoEmp = new THREE.BoxGeometry(0.8, 0.45, 0.06);
    const empV = new THREE.Mesh(geoEmp, matDark);
    empV.position.set(-1.4, 0.75, 0);
    empV.rotation.z = 0.15;
    const empH = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.65), matDark);
    empH.position.set(-1.35, 0.55, 0);

    // Hélice (arrêtée)
    const helice = new THREE.Group();
    helice.position.set(1.65, 0.55, 0);
    for (let i = 0; i < 2; i++) {
      const pale = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.06), matHelice);
      pale.rotation.z = (i / 2) * Math.PI;
      helice.add(pale);
    }

    // Moteur visible (panne)
    const moteur = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.35, 10), matDark);
    moteur.rotation.z = Math.PI / 2;
    moteur.position.set(1.45, 0.55, 0);

    this.groupe.add(fuselage, nez, cockpit, aileG, aileD, empV, empH, helice, moteur);

    // Légère inclinaison : l'avion s'est posé en catastrophe
    this.groupe.rotation.z = 0.08;
    this.groupe.rotation.y = -0.6;
  }
}
