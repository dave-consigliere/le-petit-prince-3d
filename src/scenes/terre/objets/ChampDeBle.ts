import * as THREE from 'three';
import { creerRampeAquarelle } from '../../../shaders/RampeAquarelle';
import { CONFIG } from '../../../configuration/Config';

/**
 * Le champ de blé — « le blé, qui est doré, me fera souvenir de toi »
 * (chap. XXI). Lieu central de l'apprivoisement.
 *
 * Implémentation : InstancedMesh de tiges minces. Ondulation procédurale
 * par shader de vertex pour le vent (zéro CPU par image).
 */
export class ChampDeBle {
  readonly groupe = new THREE.Group();
  private readonly mesh: THREE.InstancedMesh;
  private readonly materiau: THREE.ShaderMaterial;
  private tempsLocal = 0;

  constructor(nombreTiges: number, rayon: number) {
    const rampe = creerRampeAquarelle();

    // Géométrie d'une tige : plan vertical fin
    const geo = new THREE.PlaneGeometry(0.04, 0.7, 1, 3);
    geo.translate(0, 0.35, 0); // pivot à la base

    // Shader personnalisé pour le vent (ondulation de la tige)
    this.materiau = new THREE.ShaderMaterial({
      uniforms: {
        uTemps: { value: 0 },
        uCouleur: { value: new THREE.Color(CONFIG.PALETTE_TERRE.blé) },
        uCouleurSombre: { value: new THREE.Color(CONFIG.PALETTE_TERRE.bléSombre) },
        uRampe: { value: rampe },
      },
      vertexShader: /* glsl */ `
        uniform float uTemps;
        varying float vY;

        void main() {
          vY = position.y;
          // Position dans l'espace monde (instance + position locale)
          vec4 posInstance = instanceMatrix * vec4(position, 1.0);
          // Vent : ondulation proportionnelle à la hauteur (la base reste fixe)
          float amplitude = position.y * 0.15;
          float onde = sin(uTemps * 1.5 + posInstance.x * 0.5 + posInstance.z * 0.3);
          posInstance.x += onde * amplitude;
          posInstance.z += cos(uTemps * 1.2 + posInstance.z * 0.4) * amplitude * 0.5;
          gl_Position = projectionMatrix * modelViewMatrix * posInstance;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uCouleur;
        uniform vec3 uCouleurSombre;
        varying float vY;
        void main() {
          // Dégradé bas (sombre) → haut (doré) pour suggérer la lumière
          vec3 c = mix(uCouleurSombre, uCouleur, smoothstep(0.0, 0.7, vY));
          gl_FragColor = vec4(c, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.InstancedMesh(geo, this.materiau, nombreTiges);
    this.mesh.frustumCulled = false;

    const matrice = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const echelle = new THREE.Vector3();

    let i = 0;
    while (i < nombreTiges) {
      // Placement aléatoire dans un anneau (pas au centre où sera le renard)
      const angle = Math.random() * Math.PI * 2;
      const r = 1.5 + Math.random() * (rayon - 1.5);
      position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
      quaternion.setFromEuler(new THREE.Euler(0, Math.random() * Math.PI * 2, 0));
      const taille = 0.85 + Math.random() * 0.4;
      echelle.set(taille, taille, taille);
      matrice.compose(position, quaternion, echelle);
      this.mesh.setMatrixAt(i, matrice);
      i++;
    }
    this.mesh.instanceMatrix.needsUpdate = true;
    this.groupe.add(this.mesh);
  }

  /** Anime le vent dans le blé. */
  animer(dt: number): void {
    this.tempsLocal += dt;
    this.materiau.uniforms['uTemps']!.value = this.tempsLocal;
  }

  liberer(): void {
    this.materiau.dispose();
    this.mesh.geometry.dispose();
  }
}
