import * as THREE from 'three';
import type { ISceneModule } from '../ISceneModule';
import type { ServicesJeu } from '../../core/Services';
import { ChampGraviteSpherique } from '../../physics/ChampGravite';
import {
  ControleurJoueur,
  type CommandeDeplacement,
} from '../../characters/joueur/ControleurJoueur';
import type { BaseCamera } from '../../characters/joueur/ControleurJoueur';
import { AvatarJoueur } from '../../characters/joueur/AvatarJoueur';
import { CameraOrbitale } from '../../engine/CameraOrbitale';
import { creerRampeAquarelle } from '../../shaders/RampeAquarelle';
import { creerFondDegrade, creerEtoiles } from '../communs/ElementsCiel';
import { libererScene } from '../../utilities/Liberation';
import { CONFIG } from '../../configuration/Config';

// Temporaire partagé pour poser les objets sur la sphère.
const TMP_NORMALE = new THREE.Vector3();
const AXE_Y = new THREE.Vector3(0, 1, 0);

/**
 * Prototype B-612 (jalon M1).
 *
 * But unique : valider la gravité sphérique — le joueur fait le tour de la
 * petite planète à pied, la caméra suit, l'horizon bascule en douceur.
 * Les volcans et la rose sont de simples volumes : la scène définitive
 * (Rose animée, baobabs, entretien de la planète) arrive au jalon M2.
 */
export class SceneProtoB612 implements ISceneModule {
  readonly nom = 'proto-b612';

  private readonly scene = new THREE.Scene();
  private readonly champ = new ChampGraviteSpherique(
    new THREE.Vector3(0, 0, 0),
    CONFIG.PROTO_B612.RAYON,
  );

  private services: ServicesJeu | null = null;
  private controleur: ControleurJoueur | null = null;
  private avatar: AvatarJoueur | null = null;
  private cameraOrbitale: CameraOrbitale | null = null;

  private readonly commande: CommandeDeplacement = {
    axeHorizontal: 0,
    axeVertical: 0,
    course: false,
  };
  private readonly baseCamera: BaseCamera = {
    avant: new THREE.Vector3(0, 0, -1),
    droite: new THREE.Vector3(1, 0, 0),
  };

  async charger(services: ServicesJeu): Promise<void> {
    this.services = services;

    this.scene.background = creerFondDegrade(
      CONFIG.PALETTE_B612.cielHaut,
      CONFIG.PALETTE_B612.cielBas,
    );
    // Pas de brouillard : nous sommes dans l'espace, le ciel doit rester pur.

    this.construireLumieres();
    this.construirePlanete();
    this.construireVolcans();
    this.construireRose();
    this.scene.add(
      creerEtoiles({ nombre: 900, rayon: 220, hauteurMinimale: 0, taille: 1.4, opacite: 0.9 }),
    );

    this.controleur = new ControleurJoueur(
      this.champ,
      new THREE.Vector3(0, CONFIG.PROTO_B612.RAYON + 1, 0),
    );
    this.avatar = new AvatarJoueur();
    this.scene.add(this.avatar.groupe);

    // Cadrage rapproché : la planète est minuscule, restons intimes.
    this.cameraOrbitale = new CameraOrbitale(services.camera.camera, this.champ, {
      distance: 4.5,
      tangage: 0.5,
    });
  }

  demarrer(): void {
    if (this.controleur && this.cameraOrbitale) {
      this.cameraOrbitale.reinitialiser(this.controleur.position);
    }
  }

  mettreAJour(dtFixe: number): void {
    if (!this.services || !this.controleur || !this.avatar || !this.cameraOrbitale) return;

    const entrees = this.services.entrees;
    this.commande.axeHorizontal = entrees.axeHorizontal();
    this.commande.axeVertical = entrees.axeVertical();
    this.commande.course = entrees.courseActive();

    this.cameraOrbitale.obtenirBase(this.baseCamera);
    this.controleur.maj(dtFixe, this.commande, this.baseCamera);
    this.avatar.groupe.position.copy(this.controleur.position);
    this.avatar.groupe.quaternion.copy(this.controleur.orientation);
    this.avatar.animer(dtFixe, this.controleur.vitesseNormalisee);

    this.cameraOrbitale.maj(dtFixe, this.controleur.position, entrees);
  }

  obtenirScene(): THREE.Scene {
    return this.scene;
  }

  liberer(): void {
    libererScene(this.scene);
  }

  // ---------------------------------------------------------------- privé --

  /** Pose un objet à la surface de la planète, orienté selon la normale. */
  private poserSurPlanete(objet: THREE.Object3D, direction: THREE.Vector3): void {
    TMP_NORMALE.copy(direction).normalize();
    objet.position.copy(TMP_NORMALE).multiplyScalar(CONFIG.PROTO_B612.RAYON);
    objet.quaternion.setFromUnitVectors(AXE_Y, TMP_NORMALE);
    this.scene.add(objet);
  }

  private construireLumieres(): void {
    const lumiere = new THREE.DirectionalLight(CONFIG.PALETTE_B612.lumierePrincipale, 1.3);
    lumiere.position.set(20, 14, 16);
    this.scene.add(lumiere);
    this.scene.add(
      new THREE.HemisphereLight(
        CONFIG.PALETTE_B612.lumiereCiel,
        CONFIG.PALETTE_B612.lumiereSol,
        0.7,
      ),
    );
  }

  private construirePlanete(): void {
    const materiau = new THREE.MeshToonMaterial({
      color: CONFIG.PALETTE_B612.sol,
      gradientMap: creerRampeAquarelle(),
    });
    this.scene.add(
      new THREE.Mesh(new THREE.SphereGeometry(CONFIG.PROTO_B612.RAYON, 64, 48), materiau),
    );
  }

  /** Deux volcans actifs, un volcan éteint (détail canonique, chap. IX). */
  private construireVolcans(): void {
    const rampe = creerRampeAquarelle();
    const materiauActif = new THREE.MeshToonMaterial({
      color: CONFIG.PALETTE_B612.volcanActif,
      gradientMap: rampe,
    });
    const materiauEteint = new THREE.MeshToonMaterial({
      color: CONFIG.PALETTE_B612.volcanEteint,
      gradientMap: rampe,
    });

    const directions = [
      { direction: new THREE.Vector3(1, 0.35, 0.2), actif: true, taille: 1.0 },
      { direction: new THREE.Vector3(-0.6, 0.3, 0.9), actif: true, taille: 0.85 },
      // Le volcan éteint, plus petit : « on ne sait jamais ! »
      { direction: new THREE.Vector3(-0.4, 0.2, -1), actif: false, taille: 0.6 },
    ];
    for (const { direction, actif, taille } of directions) {
      const volcan = new THREE.Mesh(
        new THREE.ConeGeometry(0.55 * taille, 0.9 * taille, 10, 1, true),
        actif ? materiauActif : materiauEteint,
      );
      volcan.geometry.translate(0, 0.45 * taille, 0);
      this.poserSurPlanete(volcan, direction);
    }
  }

  /** Une rose provisoire : tige et corolle en volumes simples. */
  private construireRose(): void {
    const rampe = creerRampeAquarelle();
    const rose = new THREE.Group();

    const tige = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.035, 0.55, 8),
      new THREE.MeshToonMaterial({ color: CONFIG.PALETTE_B612.tige, gradientMap: rampe }),
    );
    tige.position.y = 0.28;

    const corolle = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.12, 0),
      new THREE.MeshToonMaterial({ color: CONFIG.PALETTE_B612.rose, gradientMap: rampe }),
    );
    corolle.position.y = 0.6;

    rose.add(tige, corolle);
    this.poserSurPlanete(rose, new THREE.Vector3(0.25, 1, 0.35));
  }
}
