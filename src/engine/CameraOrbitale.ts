import * as THREE from 'three';
import type { InputManager } from './InputManager';
import type { ChampGravite } from '../physics/ChampGravite';
import type { BaseCamera } from '../characters/joueur/ControleurJoueur';
import { CONFIG } from '../configuration/Config';

/** Paramètres propres à chaque scène (cadrage adapté au lieu). */
export interface ParametresCameraOrbitale {
  distance?: number;
  tangage?: number;
}

// Temporaires partagés : zéro allocation par image.
const TMP_HAUT_RIG = new THREE.Vector3();
const TMP_ALIGNEMENT = new THREE.Quaternion();
const TMP_PAS = new THREE.Quaternion();
const TMP_LACET = new THREE.Quaternion();
const TMP_ARRIERE = new THREE.Vector3();
const TMP_POSITION = new THREE.Vector3();
const TMP_VISEE = new THREE.Vector3();
const TMP_HAUT_LOCAL = new THREE.Vector3();
const DELTA_POINTEUR = { x: 0, y: 0 };

/**
 * Caméra orbitale de suivi (3e personne).
 *
 * Le « rig » est un quaternion qui encode à la fois l'alignement sur le
 * « haut » local du champ de gravité et le lacet contrôlé à la souris.
 * Le tangage est stocké à part pour pouvoir être borné simplement.
 * Cette construction fonctionne aussi bien sur un sol plan qu'autour
 * d'une petite planète : le rig se ré-aligne en douceur sur le haut local.
 */
export class CameraOrbitale {
  private readonly orientation = new THREE.Quaternion();
  private tangage: number;
  private distance: number;

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly champ: ChampGravite,
    parametres: ParametresCameraOrbitale = {},
  ) {
    this.distance = parametres.distance ?? CONFIG.CAMERA.DISTANCE_DEFAUT;
    this.tangage = parametres.tangage ?? CONFIG.CAMERA.TANGAGE_DEFAUT;
  }

  /** Place immédiatement la caméra derrière la cible (début de scène). */
  reinitialiser(cible: THREE.Vector3): void {
    this.champ.obtenirHaut(cible, TMP_HAUT_RIG);
    this.orientation.setFromUnitVectors(new THREE.Vector3(0, 1, 0), TMP_HAUT_RIG);
    this.calculerPosition(cible, TMP_POSITION);
    this.camera.position.copy(TMP_POSITION);
    this.orienterCamera(cible);
  }

  /** Mise à jour à pas fixe. */
  maj(dt: number, cible: THREE.Vector3, entrees: InputManager): void {
    // 1. Ré-alignement progressif du rig sur le « haut » local.
    const hautLocal = this.champ.obtenirHaut(cible, TMP_HAUT_LOCAL);
    TMP_HAUT_RIG.set(0, 1, 0).applyQuaternion(this.orientation);
    TMP_ALIGNEMENT.setFromUnitVectors(TMP_HAUT_RIG, hautLocal);
    const facteurAlignement = 1 - Math.exp(-CONFIG.CAMERA.VITESSE_ALIGNEMENT * dt);
    TMP_PAS.identity().slerp(TMP_ALIGNEMENT, facteurAlignement);
    this.orientation.premultiply(TMP_PAS).normalize();

    // 2. Orbite à la souris (bouton gauche maintenu) et zoom à la molette.
    entrees.consommerDeltaPointeur(DELTA_POINTEUR);
    if (DELTA_POINTEUR.x !== 0) {
      TMP_HAUT_RIG.set(0, 1, 0).applyQuaternion(this.orientation);
      TMP_LACET.setFromAxisAngle(TMP_HAUT_RIG, -DELTA_POINTEUR.x * CONFIG.CAMERA.SENSIBILITE);
      this.orientation.premultiply(TMP_LACET).normalize();
    }
    this.tangage = THREE.MathUtils.clamp(
      this.tangage + DELTA_POINTEUR.y * CONFIG.CAMERA.SENSIBILITE,
      CONFIG.CAMERA.TANGAGE_MIN,
      CONFIG.CAMERA.TANGAGE_MAX,
    );
    this.distance = THREE.MathUtils.clamp(
      this.distance + entrees.consommerDeltaMolette() * CONFIG.CAMERA.SENSIBILITE_MOLETTE,
      CONFIG.CAMERA.DISTANCE_MIN,
      CONFIG.CAMERA.DISTANCE_MAX,
    );

    // 3. Position lissée puis orientation du regard.
    this.calculerPosition(cible, TMP_POSITION);
    const facteurPosition = 1 - Math.exp(-CONFIG.CAMERA.LISSAGE_POSITION * dt);
    this.camera.position.lerp(TMP_POSITION, facteurPosition);
    this.orienterCamera(cible);
  }

  /** Fournit à un contrôleur les axes « avant » et « droite » de la caméra. */
  obtenirBase(base: BaseCamera): void {
    base.avant.set(0, 0, -1).applyQuaternion(this.orientation);
    base.droite.set(1, 0, 0).applyQuaternion(this.orientation);
  }

  // ---------------------------------------------------------------- privé --

  private calculerPosition(cible: THREE.Vector3, resultat: THREE.Vector3): void {
    TMP_ARRIERE.set(0, 0, 1).applyQuaternion(this.orientation);
    TMP_HAUT_RIG.set(0, 1, 0).applyQuaternion(this.orientation);
    resultat
      .copy(cible)
      .addScaledVector(TMP_ARRIERE, Math.cos(this.tangage) * this.distance)
      .addScaledVector(TMP_HAUT_RIG, Math.sin(this.tangage) * this.distance);
  }

  private orienterCamera(cible: THREE.Vector3): void {
    TMP_HAUT_RIG.set(0, 1, 0).applyQuaternion(this.orientation);
    this.camera.up.copy(TMP_HAUT_RIG);
    TMP_VISEE.copy(cible).addScaledVector(TMP_HAUT_RIG, CONFIG.CAMERA.HAUTEUR_VISEE);
    this.camera.lookAt(TMP_VISEE);
  }
}
