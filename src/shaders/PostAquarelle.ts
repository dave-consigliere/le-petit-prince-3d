/**
 * Passe de post-traitement « papier aquarelle » :
 * - grain de papier subtil et animé (évite l'aspect figé) ;
 * - vignette douce qui concentre le regard, comme une page de livre.
 *
 * Les intensités par défaut proviennent de CONFIG.POST_TRAITEMENT.
 */
import { CONFIG } from '../configuration/Config';

export const SHADER_GRAIN_PAPIER = {
  name: 'GrainPapierAquarelle',

  uniforms: {
    tDiffuse: { value: null },
    uTemps: { value: 0 },
    uIntensiteGrain: { value: CONFIG.POST_TRAITEMENT.grain },
    uIntensiteVignette: { value: CONFIG.POST_TRAITEMENT.vignette },
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTemps;
    uniform float uIntensiteGrain;
    uniform float uIntensiteVignette;
    varying vec2 vUv;

    // Bruit de hachage simple et peu coûteux (suffisant pour un grain de papier).
    float hachage(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      vec4 couleur = texture2D(tDiffuse, vUv);

      // Grain : très discret, légèrement animé pour évoquer la fibre du papier.
      float grain = (hachage(vUv * vec2(1920.0, 1080.0) + fract(uTemps) * 7.31) - 0.5);
      couleur.rgb += grain * uIntensiteGrain;

      // Vignette douce.
      float distanceCentre = distance(vUv, vec2(0.5));
      couleur.rgb *= 1.0 - smoothstep(0.45, 0.85, distanceCentre) * uIntensiteVignette;

      gl_FragColor = couleur;
    }
  `,
};
