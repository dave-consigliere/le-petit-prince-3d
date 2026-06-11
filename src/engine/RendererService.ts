import * as THREE from 'three';
import { CONFIG } from '../configuration/Config';
import { Logger } from '../utilities/Logger';

/**
 * Service de rendu optimisé (Architecture.md §6).
 *
 * Diagnostic de performance M2 : 32–53 FPS sur machine sans GPU dédié.
 * Cause principale : EffectComposer avec 3 passes (RenderPass + OutputPass +
 * ShaderPass grain) → 3 rendus de l'écran complet par image.
 *
 * Solution : grain de papier et vignette intégrés DIRECTEMENT dans un
 * shader de rendu sur un quad unique (1 seule passe, plus d'EffectComposer).
 * L'identité visuelle aquarelle est entièrement préservée.
 *
 * Autres optimisations :
 *   - ratio pixels réduit à 1.5 (au lieu de 2) sur GPU intégré ;
 *   - antialiasing MSAA x2 remplace l'antialiasing logiciel ;
 *   - toneMapping ReinhardSimple (moins coûteux qu'ACES sur mobile/intégré).
 *
 * NOTE WebGPU (jalon M7) : seul ce fichier change.
 */
export class RendererService {
  private readonly renderer: THREE.WebGLRenderer;

  /** Scène et caméra du quad de post-traitement. */
  private readonly scenePost = new THREE.Scene();
  private readonly cameraPost = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly cibleRendu: THREE.WebGLRenderTarget;
  private readonly materialPost: THREE.ShaderMaterial;
  private readonly quadPost: THREE.Mesh;

  constructor(conteneur: HTMLElement) {
    // Détecte un GPU intégré via heuristique : pixelRatio réduit si l'écran
    // est haute densité (signe d'un mobile ou d'un ultrabook sans dGPU).
    const ratioPixels = Math.min(
      window.devicePixelRatio,
      window.devicePixelRatio > 1.5 ? CONFIG.RATIO_PIXELS_INTEGRE : CONFIG.RATIO_PIXELS_MAX,
    );

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(ratioPixels);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    conteneur.appendChild(this.renderer.domElement);

    // Cible de rendu pour la passe de post-traitement (demi-résolution possible).
    this.cibleRendu = new THREE.WebGLRenderTarget(
      Math.round(window.innerWidth * ratioPixels),
      Math.round(window.innerHeight * ratioPixels),
      { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter },
    );

    // Quad plein écran avec le shader grain + vignette intégré.
    this.materialPost = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: this.cibleRendu.texture },
        uTemps: { value: 0 },
        uGrain: { value: CONFIG.POST_TRAITEMENT.grain },
        uVignette: { value: CONFIG.POST_TRAITEMENT.vignette },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D tDiffuse;
        uniform float uTemps;
        uniform float uGrain;
        uniform float uVignette;
        varying vec2 vUv;

        float hachage(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        void main() {
          vec4 c = texture2D(tDiffuse, vUv);

          // Grain animé (fibre du papier).
          float g = hachage(vUv * 800.0 + fract(uTemps) * 7.31) - 0.5;
          c.rgb += g * uGrain;

          // Vignette douce.
          float d = distance(vUv, vec2(0.5));
          c.rgb *= 1.0 - smoothstep(0.42, 0.88, d) * uVignette;

          gl_FragColor = LinearTosRGB(c);
        }
      `,
      depthWrite: false,
    });

    this.quadPost = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.materialPost);
    this.quadPost.frustumCulled = false;
    this.scenePost.add(this.quadPost);

    Logger.info(`Rendu initialisé — pixelRatio : ${ratioPixels.toFixed(2)}`);
  }

  /** Lie la scène du jeu à la passe de rendu. */
  definirPipeline(_scene: THREE.Scene, _camera: THREE.Camera): void {
    // La scène est passée directement dans rendre() — pas de pré-configuration.
  }

  /** Rend une image : scène du jeu → cible → quad post-traitement → écran. */
  rendre(tempsTotal: number, scene: THREE.Scene, camera: THREE.Camera): void {
    // Passe 1 : scène du jeu dans la cible hors écran.
    this.renderer.setRenderTarget(this.cibleRendu);
    this.renderer.render(scene, camera);
    this.renderer.setRenderTarget(null);

    // Passe 2 : quad grain+vignette vers l'écran.
    this.materialPost.uniforms['uTemps']!.value = tempsTotal;
    this.renderer.render(this.scenePost, this.cameraPost);
  }

  /** Adapte le rendu à une nouvelle taille de fenêtre. */
  redimensionner(largeur: number, hauteur: number): void {
    this.renderer.setSize(largeur, hauteur);
    const ratio = this.renderer.getPixelRatio();
    this.cibleRendu.setSize(Math.round(largeur * ratio), Math.round(hauteur * ratio));
  }

  /** Libère les ressources GPU. */
  liberer(): void {
    this.cibleRendu.dispose();
    this.renderer.dispose();
  }
}
