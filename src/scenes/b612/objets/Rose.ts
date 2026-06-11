import * as THREE from 'three';
import { creerRampeAquarelle } from '../../../shaders/RampeAquarelle';
import { CONFIG } from '../../../configuration/Config';

/**
 * La Rose de B-612 — version M2.
 * Quatre épines (détail canonique chap. VII-VIII), globe de verre, animation de balancement.
 */
export class Rose {
  readonly groupe = new THREE.Group();
  private readonly corpsRose = new THREE.Group();
  private globe: THREE.Mesh | null = null;
  private _globeActif = false;
  private tempsLocal = 0;

  constructor() {
    const rampe = creerRampeAquarelle();

    const tige = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.038, 0.7, 10),
      new THREE.MeshToonMaterial({ color: CONFIG.PALETTE_B612.tige, gradientMap: rampe }),
    );
    tige.position.y = 0.35;

    const matCorolle = new THREE.MeshToonMaterial({
      color: CONFIG.PALETTE_B612.rose,
      gradientMap: rampe,
      side: THREE.DoubleSide,
    });
    const corolle = new THREE.Group();
    corolle.position.y = 0.78;
    for (let i = 0; i < 5; i++) {
      const petale = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.28, 6, 1, true), matCorolle);
      petale.rotation.x = Math.PI * 0.38;
      petale.rotation.y = (i / 5) * Math.PI * 2;
      petale.position.set(
        Math.sin((i / 5) * Math.PI * 2) * 0.08,
        0.08,
        Math.cos((i / 5) * Math.PI * 2) * 0.08,
      );
      corolle.add(petale);
    }
    const bouton = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 12, 8),
      new THREE.MeshToonMaterial({ color: 0xe8b4b8, gradientMap: rampe }),
    );
    bouton.position.y = 0.12;
    corolle.add(bouton);

    // Quatre épines — détail canonique
    const matEpine = new THREE.MeshToonMaterial({ color: 0x8aad8a, gradientMap: rampe });
    for (let i = 0; i < 4; i++) {
      const epine = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.09, 5), matEpine);
      const angle = (i / 4) * Math.PI * 2;
      epine.position.set(Math.cos(angle) * 0.038, 0.2 + i * 0.1, Math.sin(angle) * 0.038);
      epine.rotation.z = (Math.cos(angle) * Math.PI) / 2.5;
      epine.rotation.x = (Math.sin(angle) * Math.PI) / 2.5;
      this.corpsRose.add(epine);
    }

    this.corpsRose.add(tige, corolle);
    this.groupe.add(this.corpsRose);
    this.creerGlobe();
  }

  set globeActif(valeur: boolean) {
    this._globeActif = valeur;
    if (this.globe) this.globe.visible = valeur;
  }
  get globeActif(): boolean {
    return this._globeActif;
  }

  animer(dt: number): void {
    this.tempsLocal += dt;
    this.corpsRose.rotation.z = Math.sin(this.tempsLocal * 1.1) * 0.04;
    this.corpsRose.rotation.x = Math.sin(this.tempsLocal * 0.7 + 1) * 0.025;
    if (this.globe && this._globeActif) {
      const mat = this.globe.material as THREE.MeshPhysicalMaterial;
      mat.opacity = 0.28 + Math.sin(this.tempsLocal * 2.3) * 0.04;
    }
  }

  private creerGlobe(): void {
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xe8f4f8,
      transparent: true,
      opacity: 0.3,
      roughness: 0.05,
      transmission: 0.85,
      side: THREE.DoubleSide,
    });
    this.globe = new THREE.Mesh(new THREE.SphereGeometry(0.55, 28, 20), mat);
    this.globe.position.y = 0.45;
    this.globe.visible = false;
    this.groupe.add(this.globe);
  }
}
