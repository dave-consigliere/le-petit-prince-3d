import * as THREE from 'three';
import { creerRampeAquarelle } from '../../../shaders/RampeAquarelle';

/**
 * Le puits du désert — détail très précis dans le livre (chap. XXV) :
 * « poulie, seau et la corde… ça ressemblait à un puits de village ».
 * L'eau est « bonne pour le cœur » — objet central du jalon M3.
 */
export class Puits {
  readonly groupe = new THREE.Group();
  private poulie: THREE.Group | null = null;
  private tempsLocal = 0;

  constructor() {
    const rampe = creerRampeAquarelle();
    const matPierre = new THREE.MeshToonMaterial({ color: 0xb8a888, gradientMap: rampe });
    const matBois = new THREE.MeshToonMaterial({ color: 0x8a6a48, gradientMap: rampe });
    const matCorde = new THREE.MeshToonMaterial({ color: 0xc8a870, gradientMap: rampe });
    const matEau = new THREE.MeshToonMaterial({
      color: 0x88c0d0,
      gradientMap: rampe,
      transparent: true,
      opacity: 0.75,
    });

    // Margelle circulaire
    const margelle = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.18, 8, 24), matPierre);
    margelle.rotation.x = Math.PI / 2;
    margelle.position.y = 0.42;

    // Corps du puits (cylindre creux = 2 cylindres)
    const exterieur = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.7, 0.85, 16), matPierre);
    exterieur.position.y = 0.0;

    // Eau au fond
    const eau = new THREE.Mesh(new THREE.CircleGeometry(0.52, 16), matEau);
    eau.rotation.x = -Math.PI / 2;
    eau.position.y = -0.38;

    // Deux montants en bois
    const geoMontant = new THREE.CylinderGeometry(0.055, 0.055, 1.4, 8);
    const montantG = new THREE.Mesh(geoMontant, matBois);
    montantG.position.set(-0.62, 1.12, 0);
    const montantD = new THREE.Mesh(geoMontant, matBois);
    montantD.position.set(0.62, 1.12, 0);

    // Poulie (traverse + roue)
    this.poulie = new THREE.Group();
    const traverse = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.28, 8), matBois);
    traverse.rotation.z = Math.PI / 2;
    traverse.position.y = 1.82;

    const roue = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.04, 8, 16), matBois);
    roue.position.y = 1.82;
    this.poulie.add(traverse, roue);

    // Seau
    const seau = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.1, 0.22, 10),
      new THREE.MeshToonMaterial({ color: 0x6a8a58, gradientMap: rampe }),
    );
    seau.position.set(0.62, 0.62, 0);

    // Corde (ligne simple)
    const ptsCorde = [
      new THREE.Vector3(0, 1.82, 0),
      new THREE.Vector3(0.1, 1.5, 0),
      new THREE.Vector3(0.3, 1.1, 0),
      new THREE.Vector3(0.52, 0.8, 0),
      new THREE.Vector3(0.62, 0.73, 0),
    ];
    const geoCorde = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(ptsCorde),
      12,
      0.018,
      6,
      false,
    );
    const corde = new THREE.Mesh(geoCorde, matCorde);

    this.groupe.add(exterieur, margelle, eau, montantG, montantD, seau, corde);
    this.groupe.add(this.poulie);
  }

  /** La poulie grince doucement dans le vent (animation contemplative). */
  animer(dt: number): void {
    this.tempsLocal += dt;
    if (this.poulie) {
      this.poulie.rotation.y = Math.sin(this.tempsLocal * 0.3) * 0.04;
    }
  }
}
