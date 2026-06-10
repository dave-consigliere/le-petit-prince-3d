import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { SHADER_GRAIN_PAPIER } from '../shaders/PostAquarelle';
import { CONFIG } from '../configuration/Config';
import { Logger } from '../utilities/Logger';

/**
 * Service de rendu (Architecture.md §6).
 *
 * Cette classe est LA SEULE à connaître le moteur de rendu concret.
 * NOTE WebGPU (jalon M7) : basculer vers WebGPURenderer ne nécessitera
 * de modifier que ce fichier ; aucun autre module n'importe WebGLRenderer.
 */
export class RendererService {
  private readonly renderer: THREE.WebGLRenderer;
  private composer: EffectComposer | null = null;
  private passeGrain: ShaderPass | null = null;

  constructor(conteneur: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.RATIO_PIXELS_MAX));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    // Exposition légèrement relevée : rendu lumineux et chaleureux (Vision §5).
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    conteneur.appendChild(this.renderer.domElement);
    Logger.info('Rendu initialisé (WebGL2).');
  }

  /**
   * Construit la chaîne de post-traitement pour une scène donnée.
   * Ordre : rendu → conversion d'espace colorimétrique → grain papier.
   */
  definirPipeline(scene: THREE.Scene, camera: THREE.Camera): void {
    this.composer?.dispose();
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(scene, camera));
    this.composer.addPass(new OutputPass());
    this.passeGrain = new ShaderPass(SHADER_GRAIN_PAPIER);
    this.composer.addPass(this.passeGrain);
  }

  /** Rend une image. Le temps total anime le grain de papier. */
  rendre(tempsTotal: number): void {
    if (!this.composer) return;
    const uniformeTemps = this.passeGrain?.uniforms['uTemps'];
    if (uniformeTemps) uniformeTemps.value = tempsTotal;
    this.composer.render();
  }

  /** Adapte le rendu à une nouvelle taille de fenêtre. */
  redimensionner(largeur: number, hauteur: number): void {
    this.renderer.setSize(largeur, hauteur);
    this.composer?.setSize(largeur, hauteur);
  }

  /** Libère les ressources GPU. */
  liberer(): void {
    this.composer?.dispose();
    this.renderer.dispose();
  }
}
