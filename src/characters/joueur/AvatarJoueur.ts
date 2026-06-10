import * as THREE from 'three';
import { creerRampeAquarelle } from '../../shaders/RampeAquarelle';

/**
 * Avatar provisoire du Petit Prince (jalon M1).
 *
 * Silhouette stylisée en volumes simples, fidèle aux couleurs des
 * aquarelles : habit vert d'eau, cheveux d'or, écharpe dorée.
 * Sera remplacé par un modèle glTF animé en Phase 5 — l'interface
 * (groupe + animer) restera identique, limitant l'impact du changement.
 *
 * Convention : l'avatar regarde vers son axe +Z (cf. ControleurJoueur).
 */
export class AvatarJoueur {
  /** Nœud racine, positionné/orienté par la scène depuis le contrôleur. */
  readonly groupe = new THREE.Group();

  /** Sous-groupe animé (rebond de marche, inclinaison, respiration). */
  private readonly corpsAnime = new THREE.Group();

  private temps = 0;

  constructor() {
    const rampe = creerRampeAquarelle();
    const materiauHabit = new THREE.MeshToonMaterial({ color: 0x7fae93, gradientMap: rampe });
    const materiauPeau = new THREE.MeshToonMaterial({ color: 0xf6d7b8, gradientMap: rampe });
    const materiauOr = new THREE.MeshToonMaterial({ color: 0xf0c34e, gradientMap: rampe });

    // Corps : léger évasement vers le bas, comme un petit manteau.
    const corps = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.3, 0.62, 14), materiauHabit);
    corps.position.y = 0.41;

    const tete = new THREE.Mesh(new THREE.SphereGeometry(0.21, 18, 14), materiauPeau);
    tete.position.y = 0.97;

    // Cheveux d'or : calotte légèrement aplatie au sommet de la tête.
    const cheveux = new THREE.Mesh(new THREE.SphereGeometry(0.225, 18, 14), materiauOr);
    cheveux.scale.set(1, 0.82, 1);
    cheveux.position.y = 1.05;

    // Écharpe : anneau autour du cou et pan flottant dans le dos (-Z).
    const echarpe = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.05, 10, 18), materiauOr);
    echarpe.rotation.x = Math.PI / 2;
    echarpe.position.y = 0.75;
    const panEcharpe = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.32, 0.025), materiauOr);
    panEcharpe.position.set(0, 0.6, -0.16);
    panEcharpe.rotation.x = 0.25;

    this.corpsAnime.add(corps, tete, cheveux, echarpe, panEcharpe);
    this.groupe.add(this.corpsAnime);
  }

  /**
   * Animation procédurale.
   * @param vitesseNormalisee 0 (immobile) à 1 (course).
   */
  animer(dt: number, vitesseNormalisee: number): void {
    this.temps += dt * (1 + vitesseNormalisee * 5);

    // Rebond de marche, proportionnel à la vitesse.
    this.corpsAnime.position.y = Math.abs(Math.sin(this.temps * 7)) * 0.05 * vitesseNormalisee;

    // Légère inclinaison vers l'avant en mouvement.
    this.corpsAnime.rotation.x = vitesseNormalisee * 0.12;

    // Respiration discrète à l'arrêt.
    const respiration = 1 + Math.sin(this.temps * 2.2) * 0.012 * (1 - vitesseNormalisee);
    this.corpsAnime.scale.set(1, respiration, 1);
  }
}
