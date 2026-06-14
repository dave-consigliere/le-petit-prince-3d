import * as THREE from 'three';
import { creerRampeAquarelle } from '../../shaders/RampeAquarelle';

/**
 * Le Serpent — « mince comme un doigt », « anneau couleur de lune ».
 * Détails canoniques (chap. XVII, XXVI) : corps enroulé doré lunaire,
 * jamais représenté comme menaçant — c'est la mort traitée poétiquement.
 */
export class AvatarSerpent {
  readonly groupe = new THREE.Group();
  private tempsLocal = 0;
  private readonly tete: THREE.Mesh;

  constructor() {
    const rampe = creerRampeAquarelle();
    const matCorps = new THREE.MeshToonMaterial({ color: 0xc8b048, gradientMap: rampe });
    const matTete = new THREE.MeshToonMaterial({ color: 0xd4bc50, gradientMap: rampe });
    const matOeil = new THREE.MeshToonMaterial({ color: 0x2a1a1a, gradientMap: rampe });

    // Spirale tubulaire (serpent enroulé)
    const points: THREE.Vector3[] = [];
    const N = 60;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const angle = t * Math.PI * 4;
      const r = 0.28 * (1 - t * 0.4);
      points.push(new THREE.Vector3(Math.cos(angle) * r, t * 0.18, Math.sin(angle) * r));
    }
    const dernier = points[points.length - 1]!;
    points.push(new THREE.Vector3(dernier.x * 0.7, 0.3, dernier.z * 0.7));
    points.push(new THREE.Vector3(0, 0.42, 0));

    const courbe = new THREE.CatmullRomCurve3(points);
    const corps = new THREE.Mesh(new THREE.TubeGeometry(courbe, 80, 0.04, 8, false), matCorps);

    this.tete = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), matTete);
    this.tete.scale.set(1.3, 0.9, 1.5);
    this.tete.position.set(0, 0.44, 0);

    for (const x of [-0.025, 0.025]) {
      const oeil = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), matOeil);
      oeil.position.set(x, 0.46, 0.06);
      this.groupe.add(oeil);
    }
    this.groupe.add(corps, this.tete);
  }

  animer(dt: number): void {
    this.tempsLocal += dt;
    this.groupe.rotation.y = Math.sin(this.tempsLocal * 0.15) * 0.04;
    this.tete.rotation.y = Math.sin(this.tempsLocal * 0.4) * 0.15;
  }
}
