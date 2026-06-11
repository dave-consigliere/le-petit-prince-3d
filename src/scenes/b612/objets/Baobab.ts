import * as THREE from 'three';
import { creerRampeAquarelle } from '../../../shaders/RampeAquarelle';

/** Pousse de baobab (arraçhable) ou petit arbre (inquiétant). */
export class Baobab {
  readonly groupe = new THREE.Group();
  private _arrache = false;

  constructor(
    readonly id: string,
    jeune = true,
  ) {
    const rampe = creerRampeAquarelle();
    const tronc = new THREE.Mesh(
      new THREE.CylinderGeometry(jeune ? 0.04 : 0.18, jeune ? 0.06 : 0.22, jeune ? 0.22 : 0.65, 8),
      new THREE.MeshToonMaterial({ color: jeune ? 0xb8a090 : 0x8a7060, gradientMap: rampe }),
    );
    tronc.position.y = jeune ? 0.11 : 0.32;
    const feuilles = new THREE.Mesh(
      new THREE.SphereGeometry(jeune ? 0.12 : 0.38, 10, 8),
      new THREE.MeshToonMaterial({ color: jeune ? 0x8aad72 : 0x5a8a52, gradientMap: rampe }),
    );
    feuilles.position.y = jeune ? 0.28 : 0.78;
    feuilles.scale.set(1, 0.75, 1);
    this.groupe.add(tronc, feuilles);
  }

  get arrache(): boolean {
    return this._arrache;
  }

  arracher(): void {
    if (this._arrache) return;
    this._arrache = true;
    const debut = performance.now();
    const animer = () => {
      const t = Math.min((performance.now() - debut) / 600, 1);
      this.groupe.scale.setScalar(1 - t);
      if (t < 1) requestAnimationFrame(animer);
      else this.groupe.visible = false;
    };
    requestAnimationFrame(animer);
  }
}
