import * as THREE from 'three';
import type { ISceneModule } from '../ISceneModule';
import type { ServicesJeu } from '../../core/Services';
import { creerRampeAquarelle } from '../../shaders/RampeAquarelle';
import { CONFIG } from '../../configuration/Config';

/**
 * Scène de test du jalon M0 — « première aquarelle ».
 *
 * Objectifs :
 * 1. valider le socle (boucle, rendu, caméra, post-traitement) à 60 FPS ;
 * 2. prototyper l'identité visuelle : dunes en aplats doux, petite planète
 *    suspendue dans le ciel (clin d'œil à B-612), étoiles, brume chaude.
 *
 * Cette scène sera remplacée par le hub Désert au jalon M1/M3.
 */
export class SceneTest implements ISceneModule {
  readonly nom = 'scene-test-aquarelle';

  private readonly scene = new THREE.Scene();
  private services: ServicesJeu | null = null;
  private planete: THREE.Mesh | null = null;
  private etoiles: THREE.Points | null = null;
  private tempsLocal = 0;

  async charger(services: ServicesJeu): Promise<void> {
    this.services = services;
    this.construireCiel();
    this.construireLumieres();
    this.construireDunes();
    this.construirePlanete();
    this.construireEtoiles();
    // Brume chaude : fond les lointains dans le ton du papier (Vision §5).
    this.scene.fog = new THREE.Fog(CONFIG.PALETTE_DESERT.brume, 40, 220);
  }

  demarrer(): void {
    const camera = this.services?.camera.camera;
    if (!camera) return;
    camera.position.set(0, 6, 22);
    camera.lookAt(0, 6, -10);
  }

  mettreAJour(dtFixe: number): void {
    this.tempsLocal += dtFixe;

    // La petite planète respire doucement : flottement et rotation lente.
    if (this.planete) {
      this.planete.position.y = 11 + Math.sin(this.tempsLocal * 0.5) * 0.4;
      this.planete.rotation.y += dtFixe * 0.1;
    }

    // Le ciel étoilé tourne imperceptiblement (contemplation).
    if (this.etoiles) this.etoiles.rotation.y += dtFixe * 0.004;

    // Très légère dérive de la caméra : l'image reste vivante sans bouger vraiment.
    const camera = this.services?.camera.camera;
    if (camera) {
      camera.position.x = Math.sin(this.tempsLocal * 0.05) * 1.2;
      camera.lookAt(0, 6, -10);
    }
  }

  obtenirScene(): THREE.Scene {
    return this.scene;
  }

  liberer(): void {
    this.scene.traverse((objet) => {
      if (objet instanceof THREE.Mesh || objet instanceof THREE.Points) {
        objet.geometry.dispose();
        const materiaux = Array.isArray(objet.material) ? objet.material : [objet.material];
        for (const materiau of materiaux) materiau.dispose();
      }
    });
    if (this.scene.background instanceof THREE.Texture) this.scene.background.dispose();
    this.scene.clear();
  }

  // ---------------------------------------------------------------- privé --

  /** Dégradé de ciel peint sur un canvas, utilisé comme fond plein écran. */
  private construireCiel(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 256;
    const contexte = canvas.getContext('2d');
    if (!contexte) return;
    const degrade = contexte.createLinearGradient(0, 0, 0, canvas.height);
    degrade.addColorStop(0, CONFIG.PALETTE_DESERT.cielHaut);
    degrade.addColorStop(1, CONFIG.PALETTE_DESERT.cielBas);
    contexte.fillStyle = degrade;
    contexte.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.scene.background = texture;
  }

  private construireLumieres(): void {
    // Soleil chaud de fin d'après-midi.
    const soleil = new THREE.DirectionalLight(CONFIG.PALETTE_DESERT.lumiereChaude, 1.4);
    soleil.position.set(14, 24, 12);
    this.scene.add(soleil);

    // Lumière d'ambiance ciel/sol : évite les ombres noires, garde la douceur.
    const ambiance = new THREE.HemisphereLight(
      CONFIG.PALETTE_DESERT.lumiereCiel,
      CONFIG.PALETTE_DESERT.lumiereSol,
      0.65,
    );
    this.scene.add(ambiance);
  }

  /** Dunes : plan déformé par une somme de sinusoïdes (suffisant au M0). */
  private construireDunes(): void {
    const geometrie = new THREE.PlaneGeometry(260, 260, 96, 96);
    geometrie.rotateX(-Math.PI / 2);

    const positions = geometrie.attributes['position'];
    if (positions) {
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        const hauteur =
          Math.sin(x * 0.045) * 1.6 +
          Math.cos(z * 0.06 + x * 0.025) * 1.1 +
          Math.sin((x + z) * 0.11) * 0.35;
        positions.setY(i, hauteur);
      }
    }
    geometrie.computeVertexNormals();

    const materiau = new THREE.MeshToonMaterial({
      color: CONFIG.PALETTE_DESERT.sable,
      gradientMap: creerRampeAquarelle(),
    });
    this.scene.add(new THREE.Mesh(geometrie, materiau));
  }

  /** Petite planète suspendue — clin d'œil à B-612, juste au-dessus de nous. */
  private construirePlanete(): void {
    const geometrie = new THREE.SphereGeometry(3, 48, 32);
    const materiau = new THREE.MeshToonMaterial({
      color: CONFIG.PALETTE_DESERT.planete,
      gradientMap: creerRampeAquarelle([110, 170, 230, 255]),
    });
    this.planete = new THREE.Mesh(geometrie, materiau);
    this.planete.position.set(0, 11, -28);
    this.scene.add(this.planete);
  }

  /** Champ d'étoiles discret, visible dans le haut du ciel. */
  private construireEtoiles(): void {
    const NOMBRE_ETOILES = 400;
    const positions = new Float32Array(NOMBRE_ETOILES * 3);
    for (let i = 0; i < NOMBRE_ETOILES; i++) {
      // Distribution sur une demi-sphère lointaine, au-dessus de l'horizon.
      const angle = Math.random() * Math.PI * 2;
      const elevation = Math.acos(Math.random() * 0.9); // favorise le zénith
      const rayon = 240;
      positions[i * 3] = rayon * Math.sin(elevation) * Math.cos(angle);
      positions[i * 3 + 1] = Math.abs(rayon * Math.cos(elevation)) + 12;
      positions[i * 3 + 2] = rayon * Math.sin(elevation) * Math.sin(angle);
    }
    const geometrie = new THREE.BufferGeometry();
    geometrie.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const materiau = new THREE.PointsMaterial({
      color: 0xfff8e7,
      size: 1.6,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85,
      fog: false, // les étoiles ne doivent pas être mangées par la brume
    });
    this.etoiles = new THREE.Points(geometrie, materiau);
    this.scene.add(this.etoiles);
  }
}
