import * as THREE from 'three';
import { creerRampeAquarelle } from '../../../shaders/RampeAquarelle';
import { CONFIG } from '../../../configuration/Config';

/**
 * Rose terrestre — une parmi 5000, instanciée pour performance.
 *
 * Détail canonique (chap. XX) : « il en était cinq mille, toutes
 * semblables, dans un seul jardin » — la crise existentielle du Prince.
 * Pour 5000 instances : InstancedMesh obligatoire (1 seul appel GPU).
 */
export class JardinRoses {
  readonly groupe = new THREE.Group();
  private readonly meshTige: THREE.InstancedMesh;
  private readonly meshFleur: THREE.InstancedMesh;

  constructor(nombreRoses: number, rayon: number) {
    const rampe = creerRampeAquarelle();
    const matTige = new THREE.MeshToonMaterial({
      color: CONFIG.PALETTE_TERRE.feuilleRose,
      gradientMap: rampe,
    });
    const matFleur = new THREE.MeshToonMaterial({
      color: CONFIG.PALETTE_TERRE.rose,
      gradientMap: rampe,
    });

    const geoTige = new THREE.CylinderGeometry(0.025, 0.035, 0.5, 6);
    const geoFleur = new THREE.IcosahedronGeometry(0.1, 0);

    this.meshTige = new THREE.InstancedMesh(geoTige, matTige, nombreRoses);
    this.meshFleur = new THREE.InstancedMesh(geoFleur, matFleur, nombreRoses);

    const matrice = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const echelle = new THREE.Vector3();

    // Placement en grille semi-aléatoire dans un cercle
    let i = 0;
    const cote = Math.ceil(Math.sqrt((nombreRoses * 4) / Math.PI));
    const espace = (rayon * 2) / cote;
    for (let cx = -cote / 2; cx < cote / 2 && i < nombreRoses; cx++) {
      for (let cz = -cote / 2; cz < cote / 2 && i < nombreRoses; cz++) {
        const x = cx * espace + (Math.random() - 0.5) * espace * 0.6;
        const z = cz * espace + (Math.random() - 0.5) * espace * 0.6;
        if (Math.hypot(x, z) > rayon) continue;

        const variation = 0.85 + Math.random() * 0.3;
        position.set(x, 0.25 * variation, z);
        quaternion.setFromEuler(new THREE.Euler(0, Math.random() * Math.PI * 2, 0));
        echelle.set(variation, variation, variation);
        matrice.compose(position, quaternion, echelle);
        this.meshTige.setMatrixAt(i, matrice);

        position.y = 0.55 * variation;
        echelle.setScalar(variation);
        matrice.compose(position, quaternion, echelle);
        this.meshFleur.setMatrixAt(i, matrice);
        i++;
      }
    }
    // Mise à jour des instances effectives
    this.meshTige.count = i;
    this.meshFleur.count = i;
    this.meshTige.instanceMatrix.needsUpdate = true;
    this.meshFleur.instanceMatrix.needsUpdate = true;

    this.groupe.add(this.meshTige, this.meshFleur);
  }
}
