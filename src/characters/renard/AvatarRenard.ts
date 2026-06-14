import * as THREE from 'three';
import { creerRampeAquarelle } from '../../shaders/RampeAquarelle';
import { CONFIG } from '../../configuration/Config';

/**
 * Le Renard — personnage central du chap. XXI.
 *
 * Détails canoniques :
 *   - couleur orangée, ventre clair, oreilles pointues ;
 *   - timide au début, devient ami par l'apprivoisement ;
 *   - assis et observant le Prince à distance.
 *
 * Animation : queue qui ondule, oreilles qui s'orientent, regard
 * qui suit le joueur. L'intensité de l'animation augmente avec
 * le niveau d'apprivoisement.
 */
export class AvatarRenard {
  readonly groupe = new THREE.Group();
  private readonly queue: THREE.Mesh;
  private readonly oreilleG: THREE.Mesh;
  private readonly oreilleD: THREE.Mesh;
  private readonly tete: THREE.Group;
  private tempsLocal = 0;

  /** Niveau d'apprivoisement [0 ; 1] — pilote l'animation. */
  niveauApprivoisement = 0;

  constructor() {
    const rampe = creerRampeAquarelle();
    const matCorps = new THREE.MeshToonMaterial({
      color: CONFIG.PALETTE_TERRE.renard,
      gradientMap: rampe,
    });
    const matVentre = new THREE.MeshToonMaterial({
      color: CONFIG.PALETTE_TERRE.renardVentre,
      gradientMap: rampe,
    });
    const matNoir = new THREE.MeshToonMaterial({ color: 0x2a1a1a, gradientMap: rampe });

    // Corps : ovoïde allongé, le renard est assis
    const corps = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), matCorps);
    corps.scale.set(1, 1.1, 1.4);
    corps.position.y = 0.22;

    // Ventre clair
    const ventre = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), matVentre);
    ventre.scale.set(0.7, 0.8, 1.1);
    ventre.position.set(0, 0.18, 0.08);

    // Pattes avant (le renard est assis, elles tiennent debout)
    for (const x of [-0.1, 0.1]) {
      const patte = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.22, 8), matCorps);
      patte.position.set(x, 0.11, 0.18);
      this.groupe.add(patte);
    }

    // Tête : sous-groupe pour pouvoir l'orienter vers le joueur
    this.tete = new THREE.Group();
    this.tete.position.set(0, 0.42, 0.15);

    const crane = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 10), matCorps);
    crane.scale.set(1, 0.9, 1.05);

    // Museau pointu (cône)
    const museau = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 10), matCorps);
    museau.rotation.x = Math.PI / 2;
    museau.position.set(0, -0.02, 0.15);

    // Museau ventre clair
    const museauClair = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.1, 8), matVentre);
    museauClair.rotation.x = Math.PI / 2;
    museauClair.position.set(0, -0.05, 0.16);

    // Nez noir
    const nez = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), matNoir);
    nez.position.set(0, -0.02, 0.24);

    // Yeux
    for (const x of [-0.05, 0.05]) {
      const oeil = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), matNoir);
      oeil.position.set(x, 0.04, 0.09);
      this.tete.add(oeil);
    }

    // Oreilles triangulaires pointues
    this.oreilleG = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 6), matCorps);
    this.oreilleG.position.set(-0.09, 0.13, 0);
    this.oreilleG.rotation.z = 0.2;
    this.oreilleD = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 6), matCorps);
    this.oreilleD.position.set(0.09, 0.13, 0);
    this.oreilleD.rotation.z = -0.2;

    this.tete.add(crane, museau, museauClair, nez, this.oreilleG, this.oreilleD);

    // Queue : longue, touffue, blanche au bout
    const courbe = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.18, -0.2),
      new THREE.Vector3(0, 0.3, -0.4),
      new THREE.Vector3(0, 0.5, -0.5),
      new THREE.Vector3(0, 0.65, -0.45),
    ]);
    this.queue = new THREE.Mesh(new THREE.TubeGeometry(courbe, 24, 0.07, 8, false), matCorps);
    const boutQueue = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), matVentre);
    boutQueue.position.set(0, 0.65, -0.45);

    this.groupe.add(corps, ventre, this.tete, this.queue, boutQueue);
  }

  /** Tourne la tête du renard vers une cible (le joueur). */
  regarder(cible: THREE.Vector3): void {
    const positionMondiale = new THREE.Vector3();
    this.tete.getWorldPosition(positionMondiale);
    const direction = new THREE.Vector3().subVectors(cible, positionMondiale);
    // Convertir dans le repère local du groupe parent
    const inverseQuat = new THREE.Quaternion().copy(this.groupe.quaternion).invert();
    direction.applyQuaternion(inverseQuat);

    const angleY = Math.atan2(direction.x, direction.z);
    const angleClampe = Math.max(-0.7, Math.min(0.7, angleY));
    this.tete.rotation.y = THREE.MathUtils.lerp(
      this.tete.rotation.y,
      angleClampe,
      0.05 + this.niveauApprivoisement * 0.1,
    );
  }

  /**
   * Animation : la queue ondule, les oreilles s'animent.
   * L'intensité dépend de l'apprivoisement (renard joyeux à la fin).
   */
  animer(dt: number): void {
    this.tempsLocal += dt;
    const intensite = 0.3 + this.niveauApprivoisement * 0.7;
    // La queue remue
    this.queue.rotation.z = Math.sin(this.tempsLocal * 3) * 0.12 * intensite;
    // Les oreilles tressautent légèrement
    this.oreilleG.rotation.x = Math.sin(this.tempsLocal * 1.4) * 0.04 * intensite;
    this.oreilleD.rotation.x = Math.sin(this.tempsLocal * 1.4 + 0.3) * 0.04 * intensite;
  }
}
