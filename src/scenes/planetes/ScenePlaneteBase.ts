import * as THREE from 'three';
import type { ISceneModule } from '../ISceneModule';
import type { ServicesJeu } from '../../core/Services';
import { ChampGraviteSpherique } from '../../physics/ChampGravite';
import { EnsembleObstacles } from '../../physics/Obstacles';
import {
  ControleurJoueur,
  type CommandeDeplacement,
  type BaseCamera,
} from '../../characters/joueur/ControleurJoueur';
import { AvatarJoueur } from '../../characters/joueur/AvatarJoueur';
import { CameraOrbitale } from '../../engine/CameraOrbitale';
import { creerFondDegrade, creerEtoiles } from '../communs/ElementsCiel';
import { libererScene } from '../../utilities/Liberation';
import { creerRampeAquarelle } from '../../shaders/RampeAquarelle';
import { Journal } from '../../game/Journal';
import { DialogueManager } from '../../dialogues/DialogueManager';
import type { ArbreDialogue } from '../../dialogues/TypesDialogue';
import { FenetreDialogue } from '../../ui/FenetreDialogue';
import { FenetreJournal } from '../../ui/FenetreJournal';
import { BoutonInteraction, libellePourType } from '../../ui/BoutonInteraction';
import { CONFIG } from '../../configuration/Config';

/** Point d'interaction générique. */
export interface PointInteraction {
  position: THREE.Vector3;
  rayon: number;
  type: string;
  action: () => void;
}

const TMP_NORMALE = new THREE.Vector3();
const AXE_Y = new THREE.Vector3(0, 1, 0);

/** Palette minimale attendue par la classe de base. */
export interface PalettePlanete {
  cielHaut: string;
  cielBas: string;
  sol: number;
  lumiere: number;
  ambiance: number;
}

/**
 * Classe de base commune aux six planètes visitées.
 *
 * Factorise : sphère planète, lumières, étoiles, joueur, caméra,
 * dialogue, journal, bouton interaction.
 * Chaque planète surcharge construireDecor() et obtenirArbreDialogue().
 */
export abstract class ScenePlaneteBase implements ISceneModule {
  abstract readonly nom: string;
  abstract readonly idObjectifProgression: string;

  protected readonly scene = new THREE.Scene();
  protected readonly champ: ChampGraviteSpherique;
  protected readonly obstacles = new EnsembleObstacles();
  protected readonly points: PointInteraction[] = [];

  protected services: ServicesJeu | null = null;
  protected controleur: ControleurJoueur | null = null;
  protected avatar: AvatarJoueur | null = null;
  protected cameraOrbitale: CameraOrbitale | null = null;
  protected journal!: Journal;
  protected dialogueManager!: DialogueManager;

  private fenetreDialogue!: FenetreDialogue;
  private fenetreJournal!: FenetreJournal;
  private boutonInteraction!: BoutonInteraction;

  private readonly commande: CommandeDeplacement = {
    axeHorizontal: 0,
    axeVertical: 0,
    course: false,
  };
  private readonly baseCamera: BaseCamera = {
    avant: new THREE.Vector3(0, 0, -1),
    droite: new THREE.Vector3(1, 0, 0),
  };

  private interactionTouche = false;
  private journalTouche = false;

  constructor(protected readonly palette: PalettePlanete) {
    this.champ = new ChampGraviteSpherique(new THREE.Vector3(0, 0, 0), CONFIG.RAYON_PLANETE);
  }

  async charger(services: ServicesJeu): Promise<void> {
    this.services = services;

    this.scene.background = creerFondDegrade(this.palette.cielHaut, this.palette.cielBas);
    this.construireLumieres();
    this.construirePlanete();
    this.scene.add(
      creerEtoiles({ nombre: 700, rayon: 200, hauteurMinimale: 0, taille: 1.3, opacite: 0.88 }),
    );
    await this.construireDecor();

    const posDepart = new THREE.Vector3(0, CONFIG.RAYON_PLANETE + 1, 0);
    this.controleur = new ControleurJoueur(this.champ, posDepart, this.obstacles);
    this.avatar = new AvatarJoueur();
    this.scene.add(this.avatar.groupe);

    this.cameraOrbitale = new CameraOrbitale(services.camera.camera, this.champ, {
      distance: 4.5,
      tangage: 0.5,
    });

    this.journal = new Journal(services.evenements);
    this.dialogueManager = new DialogueManager(this.journal, services.evenements);
    this.fenetreDialogue = new FenetreDialogue(this.dialogueManager);
    this.fenetreJournal = new FenetreJournal(this.journal);
    this.boutonInteraction = new BoutonInteraction();
  }

  demarrer(): void {
    if (this.controleur && this.cameraOrbitale) {
      this.cameraOrbitale.reinitialiser(this.controleur.position);
    }
    this.services?.evenements.emettre('audio:musique', { piste: this.nom, fondu: 2 });
    this.services?.progression.remplirObjectif(this.idObjectifProgression);
  }

  mettreAJour(dtFixe: number): void {
    if (!this.services || !this.controleur || !this.avatar || !this.cameraOrbitale) return;

    const entrees = this.services.entrees;
    const dialogueActif = this.dialogueManager.etat.actif;

    if (!dialogueActif) {
      this.commande.axeHorizontal = entrees.axeHorizontal();
      this.commande.axeVertical = entrees.axeVertical();
      this.commande.course = entrees.courseActive();
      this.cameraOrbitale.obtenirBase(this.baseCamera);
      this.controleur.maj(dtFixe, this.commande, this.baseCamera);
    } else {
      this.commande.axeHorizontal = 0;
      this.commande.axeVertical = 0;
    }

    this.avatar.groupe.position.copy(this.controleur.position);
    this.avatar.groupe.quaternion.copy(this.controleur.orientation);
    this.avatar.animer(dtFixe, this.controleur.vitesseNormalisee);
    this.cameraOrbitale.maj(dtFixe, this.controleur.position, entrees);
    this.animer(dtFixe);
    this.mettreAJourInteraction();

    const eTouche = entrees.estEnfoncee('KeyE');
    if (eTouche && !this.interactionTouche) {
      this.interactionTouche = true;
      if (dialogueActif) this.dialogueManager.avancer();
      else this.declencher();
    }
    if (!eTouche) this.interactionTouche = false;

    const jTouche = entrees.estEnfoncee('KeyJ');
    if (jTouche && !this.journalTouche) {
      this.journalTouche = true;
      this.fenetreJournal.basculer();
    }
    if (!jTouche) this.journalTouche = false;
  }

  obtenirScene(): THREE.Scene {
    return this.scene;
  }

  liberer(): void {
    this.fenetreDialogue.liberer();
    this.fenetreJournal.liberer();
    this.boutonInteraction.liberer();
    libererScene(this.scene);
  }

  // ---------------------------------------------------------------- abstraits

  /** Construit les éléments visuels spécifiques à la planète. */
  protected abstract construireDecor(): Promise<void>;

  /** Retourne l'arbre de dialogue du personnage. */
  protected abstract obtenirArbreDialogue(): ArbreDialogue;

  // ---------------------------------------------------------------- communs

  /** Pose un objet à la surface de la planète. */
  protected poserSurPlanete(objet: THREE.Object3D, direction: THREE.Vector3): THREE.Vector3 {
    TMP_NORMALE.copy(direction).normalize();
    objet.position.copy(TMP_NORMALE).multiplyScalar(CONFIG.RAYON_PLANETE);
    objet.quaternion.setFromUnitVectors(AXE_Y, TMP_NORMALE);
    this.scene.add(objet);
    return objet.position.clone();
  }

  /** Ajoute un point d'interaction vers le personnage principal. */
  protected ajouterInteractionPersonnage(position: THREE.Vector3): void {
    this.points.push({
      position,
      rayon: 2.5,
      type: 'rose',
      action: () => {
        this.dialogueManager.demarrer(this.obtenirArbreDialogue());
      },
    });
    this.obstacles.ajouter(position, 0.9);
  }

  /** Animations spécifiques — surcharger si nécessaire. */
  protected animer(_dtFixe: number): void {}

  // ---------------------------------------------------------------- privé

  private construireLumieres(): void {
    const lum = new THREE.DirectionalLight(this.palette.lumiere, 1.3);
    lum.position.set(16, 12, 14);
    this.scene.add(lum);
    this.scene.add(new THREE.HemisphereLight(this.palette.lumiere, this.palette.ambiance, 0.6));
  }

  private construirePlanete(): void {
    const geo = new THREE.SphereGeometry(CONFIG.RAYON_PLANETE, 56, 40);
    const mat = new THREE.MeshToonMaterial({
      color: this.palette.sol,
      gradientMap: creerRampeAquarelle(),
    });
    this.scene.add(new THREE.Mesh(geo, mat));
  }

  private mettreAJourInteraction(): void {
    if (!this.controleur || this.dialogueManager.etat.actif) {
      this.boutonInteraction.masquer();
      return;
    }
    let plusProche: PointInteraction | null = null;
    let distMin = Infinity;
    for (const pt of this.points) {
      const d = this.controleur.position.distanceTo(pt.position);
      if (d < pt.rayon && d < distMin) {
        distMin = d;
        plusProche = pt;
      }
    }
    if (plusProche) this.boutonInteraction.afficher(libellePourType(plusProche.type));
    else this.boutonInteraction.masquer();
  }

  private declencher(): void {
    if (!this.controleur) return;
    let plusProche: PointInteraction | null = null;
    let distMin = Infinity;
    for (const pt of this.points) {
      const d = this.controleur.position.distanceTo(pt.position);
      if (d < pt.rayon && d < distMin) {
        distMin = d;
        plusProche = pt;
      }
    }
    plusProche?.action();
  }
}
