import * as THREE from 'three';
import { creerRampeAquarelle } from '../../../shaders/RampeAquarelle';
import { CONFIG } from '../../../configuration/Config';

/** Volcan actif (fumée procédurale) ou éteint. */
export class Volcan {
  readonly groupe = new THREE.Group();
  private fumee: THREE.Points | null = null;
  private tempsLocal = 0;
  private _ramone = false;

  constructor(
    readonly id: string,
    readonly actif: boolean,
    taille = 1.0,
  ) {
    const rampe = creerRampeAquarelle();
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.55 * taille, 1.1 * taille, 12),
      new THREE.MeshToonMaterial({
        color: actif ? CONFIG.PALETTE_B612.volcanActif : CONFIG.PALETTE_B612.volcanEteint,
        gradientMap: rampe,
      }),
    );
    cone.position.y = 0.55 * taille;
    this.groupe.add(cone);

    if (actif) {
      const lueur = new THREE.Mesh(
        new THREE.CircleGeometry(0.2 * taille, 12),
        new THREE.MeshBasicMaterial({ color: 0xff6633, transparent: true, opacity: 0.85 }),
      );
      lueur.position.y = 1.1 * taille + 0.01;
      lueur.rotation.x = -Math.PI / 2;
      this.groupe.add(lueur);
      this.creerFumee(taille);
    }
  }

  get ramone(): boolean {
    return this._ramone;
  }

  ramoner(): void {
    this._ramone = true;
    if (this.fumee) (this.fumee.material as THREE.PointsMaterial).opacity = 0.12;
  }

  animer(dt: number): void {
    this.tempsLocal += dt;
    if (!this.fumee) return;
    const positions = this.fumee.geometry.attributes['position'];
    if (!positions) return;
    for (let i = 0; i < positions.count; i++) {
      let y = positions.getY(i) + dt * (this._ramone ? 0.15 : 0.35);
      if (y > 2.5) y = 1.12;
      positions.setY(i, y);
      positions.setX(i, positions.getX(i) + Math.sin(this.tempsLocal + i) * 0.003);
    }
    positions.needsUpdate = true;
    this.fumee.rotation.y += dt * 0.2;
  }

  private creerFumee(taille: number): void {
    const N = 28;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.18 * taille;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = 1.12 * taille + Math.random() * 1.2;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.fumee = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: 0xbbbbbb,
        size: 0.18,
        transparent: true,
        opacity: 0.45,
        fog: false,
      }),
    );
    this.groupe.add(this.fumee);
  }
}
