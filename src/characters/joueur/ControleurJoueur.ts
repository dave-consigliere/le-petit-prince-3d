import * as THREE from 'three';
import type { ChampGravite } from '../../physics/ChampGravite';
import type { EnsembleObstacles } from '../../physics/Obstacles';
import { CONFIG } from '../../configuration/Config';

/** Intention de déplacement, indépendante du périphérique d'entrée. */
export interface CommandeDeplacement {
  /** -1 (gauche) à 1 (droite). */
  axeHorizontal: number;
  /** -1 (reculer) à 1 (avancer). */
  axeVertical: number;
  /** Course activée (Maj). */
  course: boolean;
}

/** Base d'orientation fournie par la caméra (vecteurs unitaires). */
export interface BaseCamera {
  avant: THREE.Vector3;
  droite: THREE.Vector3;
}

// Vecteurs temporaires partagés : aucune allocation pendant la boucle de jeu.
const TMP_HAUT = new THREE.Vector3();
const TMP_DIRECTION = new THREE.Vector3();
const TMP_AXE_X = new THREE.Vector3();
const TMP_AXE_Z = new THREE.Vector3();
const TMP_MATRICE = new THREE.Matrix4();
const TMP_QUATERNION = new THREE.Quaternion();

/**
 * Contrôleur cinématique du joueur.
 *
 * Principe : le contrôleur ne connaît ni le clavier (il reçoit une
 * CommandeDeplacement), ni la forme du monde (il interroge un ChampGravite),
 * ni la caméra (il reçoit une BaseCamera). Il est donc testable sans DOM
 * et fonctionne tel quel sur un plan ou autour d'une planète.
 */
export class ControleurJoueur {
  /** Position du joueur, collée au sol. */
  readonly position = new THREE.Vector3();

  /** Orientation de l'avatar (le modèle regarde vers son axe +Z). */
  readonly orientation = new THREE.Quaternion();

  private vitesseActuelle = 0;
  private readonly directionDeplacement = new THREE.Vector3(0, 0, 1);

  constructor(
    private readonly champ: ChampGravite,
    positionInitiale: THREE.Vector3,
    /** Obstacles du décor (optionnels) : le joueur glisse le long d'eux. */
    private readonly obstacles: EnsembleObstacles | null = null,
  ) {
    this.champ.projeterAuSol(positionInitiale, this.position);
    this.champ.obtenirHaut(this.position, TMP_HAUT);
    this.orientation.setFromUnitVectors(new THREE.Vector3(0, 1, 0), TMP_HAUT);
  }

  /** Vitesse normalisée [0 ; 1], utilisée pour piloter les animations. */
  get vitesseNormalisee(): number {
    return this.vitesseActuelle / CONFIG.JOUEUR.VITESSE_COURSE;
  }

  /** Mise à jour à pas fixe. */
  maj(dt: number, commande: CommandeDeplacement, base: BaseCamera): void {
    this.champ.obtenirHaut(this.position, TMP_HAUT);

    // 1. Direction souhaitée : combinaison des axes, projetée sur le plan
    //    tangent au sol (perpendiculaire au « haut » local).
    TMP_DIRECTION.set(0, 0, 0)
      .addScaledVector(base.avant, commande.axeVertical)
      .addScaledVector(base.droite, commande.axeHorizontal);
    TMP_DIRECTION.addScaledVector(TMP_HAUT, -TMP_DIRECTION.dot(TMP_HAUT));

    const enMouvement = TMP_DIRECTION.lengthSq() > 1e-6;
    if (enMouvement) this.directionDeplacement.copy(TMP_DIRECTION).normalize();

    // 2. Vitesse : amortissement exponentiel vers la vitesse cible
    //    (départs et arrêts doux — l'expérience doit rester contemplative).
    const vitesseCible = enMouvement
      ? commande.course
        ? CONFIG.JOUEUR.VITESSE_COURSE
        : CONFIG.JOUEUR.VITESSE_MARCHE
      : 0;
    this.vitesseActuelle = THREE.MathUtils.damp(
      this.vitesseActuelle,
      vitesseCible,
      CONFIG.JOUEUR.AMORTISSEMENT_VITESSE,
      dt,
    );

    // 3. Déplacement, obstacles, limites du monde, puis adhérence au sol.
    this.position.addScaledVector(this.directionDeplacement, this.vitesseActuelle * dt);
    this.obstacles?.repousser(this.position, CONFIG.JOUEUR.RAYON_COLLISION, TMP_HAUT);
    this.champ.contraindre(this.position);
    this.champ.projeterAuSol(this.position, this.position);

    // 4. Orientation de l'avatar : « haut » local + regard vers la direction
    //    de déplacement (base orthonormée reconstruite, puis rotation lissée).
    this.champ.obtenirHaut(this.position, TMP_HAUT);
    TMP_AXE_Z.copy(this.directionDeplacement).addScaledVector(
      TMP_HAUT,
      -this.directionDeplacement.dot(TMP_HAUT),
    );
    if (TMP_AXE_Z.lengthSq() < 1e-8) TMP_AXE_Z.set(0, 0, 1);
    TMP_AXE_Z.normalize();
    TMP_AXE_X.crossVectors(TMP_HAUT, TMP_AXE_Z).normalize();
    TMP_AXE_Z.crossVectors(TMP_AXE_X, TMP_HAUT).normalize();
    TMP_MATRICE.makeBasis(TMP_AXE_X, TMP_HAUT, TMP_AXE_Z);
    TMP_QUATERNION.setFromRotationMatrix(TMP_MATRICE);

    const facteurRotation = 1 - Math.exp(-CONFIG.JOUEUR.VITESSE_ROTATION * dt);
    this.orientation.slerp(TMP_QUATERNION, facteurRotation);
  }
}
