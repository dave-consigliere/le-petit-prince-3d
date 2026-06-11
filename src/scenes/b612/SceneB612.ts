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
import { Rose } from './objets/Rose';
import { Baobab } from './objets/Baobab';
import { Volcan } from './objets/Volcan';
import { Journal } from '../../game/Journal';
import { DialogueManager } from '../../dialogues/DialogueManager';
import { dialogueRose } from '../../dialogues/arbres/dialogueRose';
import { FenetreDialogue } from '../../ui/FenetreDialogue';
import { FenetreJournal } from '../../ui/FenetreJournal';
import { BoutonInteraction, libellePourType } from '../../ui/BoutonInteraction';
import { LocalizationManager } from '../../localization/LocalizationManager';
import { CONFIG } from '../../configuration/Config';
import { creerRampeAquarelle } from '../../shaders/RampeAquarelle';

/** Point interactif de la scène. */
interface PointInteraction {
  position: THREE.Vector3;
  rayon: number;
  type: string;
  action: () => void;
}

// Temporaires partagés
const TMP_NORMALE = new THREE.Vector3();
const AXE_Y = new THREE.Vector3(0, 1, 0);

/**
 * Astéroïde B-612 — version définitive (jalon M2).
 *
 * Mécaniques :
 *   - arroser la Rose (interaction E) → entrée journal ;
 *   - ramoner les volcans (interaction E) → fumée réduite ;
 *   - arracher les baobabs (interaction E) → disparition animée ;
 *   - parler à la Rose (interaction E quand globe visible) → dialogue.
 *   - touche J → journal de voyage.
 */
export class SceneB612 implements ISceneModule {
  readonly nom = 'b612';

  private readonly scene = new THREE.Scene();
  private readonly champ = new ChampGraviteSpherique(new THREE.Vector3(), CONFIG.PROTO_B612.RAYON);
  private readonly obstacles = new EnsembleObstacles();

  private services: ServicesJeu | null = null;
  private controleur: ControleurJoueur | null = null;
  private avatar: AvatarJoueur | null = null;
  private cameraOrbitale: CameraOrbitale | null = null;

  // Objets interactifs
  private rose!: Rose;
  private readonly volcans: Volcan[] = [];
  private readonly baobabs: Baobab[] = [];
  private readonly points: PointInteraction[] = [];

  // Systèmes UI
  private journal!: Journal;
  private dialogueManager!: DialogueManager;
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
  private journalTouche = false;
  private interactionTouche = false;

  async charger(services: ServicesJeu): Promise<void> {
    this.services = services;

    this.scene.background = creerFondDegrade(
      CONFIG.PALETTE_B612.cielHaut,
      CONFIG.PALETTE_B612.cielBas,
    );
    this.construireLumieres();
    this.construirePlanete();
    this.construireObjets();
    this.scene.add(
      creerEtoiles({ nombre: 900, rayon: 220, hauteurMinimale: 0, taille: 1.4, opacite: 0.9 }),
    );

    this.controleur = new ControleurJoueur(
      this.champ,
      new THREE.Vector3(0, CONFIG.PROTO_B612.RAYON + 1, 0),
      this.obstacles,
    );
    this.avatar = new AvatarJoueur();
    this.scene.add(this.avatar.groupe);
    this.cameraOrbitale = new CameraOrbitale(services.camera.camera, this.champ, {
      distance: 4.5,
      tangage: 0.5,
    });

    // Systèmes de jeu
    this.journal = new Journal(services.evenements);
    this.dialogueManager = new DialogueManager(this.journal, services.evenements);
    this.fenetreDialogue = new FenetreDialogue(this.dialogueManager);
    this.fenetreJournal = new FenetreJournal(this.journal);
    this.boutonInteraction = new BoutonInteraction();

    // Entrée journal au chargement de la scène
    this.journal.ajouter({
      id: 'b612_arrivee',
      ...LocalizationManager.journal.b612_arrivee,
    });
  }

  demarrer(): void {
    if (this.controleur && this.cameraOrbitale) {
      this.cameraOrbitale.reinitialiser(this.controleur.position);
    }
    this.services?.evenements.emettre('audio:musique', { piste: 'b612', fondu: 2 });
  }

  mettreAJour(dtFixe: number): void {
    if (!this.services || !this.controleur || !this.avatar || !this.cameraOrbitale) return;

    const entrees = this.services.entrees;
    const dialogueActif = this.dialogueManager.etat.actif;

    // Mouvement bloqué pendant un dialogue
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

    // Animations des objets
    this.rose.animer(dtFixe);
    for (const v of this.volcans) v.animer(dtFixe);

    // Détection du point d'interaction le plus proche
    this.mettreAJourInteraction();

    // Touche E : interagir
    const eTouche = entrees.estEnfoncee('KeyE');
    if (eTouche && !this.interactionTouche) {
      this.interactionTouche = true;
      if (dialogueActif) {
        this.dialogueManager.avancer();
      } else {
        this.declencher();
      }
    }
    if (!eTouche) this.interactionTouche = false;

    // Touche J : journal
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

  // ---------------------------------------------------------------- privé --

  private poserSurPlanete(objet: THREE.Object3D, direction: THREE.Vector3): void {
    TMP_NORMALE.copy(direction).normalize();
    objet.position.copy(TMP_NORMALE).multiplyScalar(CONFIG.PROTO_B612.RAYON);
    objet.quaternion.setFromUnitVectors(AXE_Y, TMP_NORMALE);
    this.scene.add(objet);
  }

  private construireLumieres(): void {
    const lum = new THREE.DirectionalLight(CONFIG.PALETTE_B612.lumierePrincipale, 1.3);
    lum.position.set(20, 14, 16);
    this.scene.add(lum);
    this.scene.add(
      new THREE.HemisphereLight(
        CONFIG.PALETTE_B612.lumiereCiel,
        CONFIG.PALETTE_B612.lumiereSol,
        0.7,
      ),
    );
  }

  private construirePlanete(): void {
    const geo = new THREE.SphereGeometry(CONFIG.PROTO_B612.RAYON, 64, 48);
    // Relief léger via déformation des vertices (collines douces)
    const pos = geo.attributes['position'];
    if (pos) {
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i),
          y = pos.getY(i),
          z = pos.getZ(i);
        const n = (Math.sin(x * 1.8 + 0.5) * Math.cos(z * 2.1) + Math.sin(y * 2.3)) * 0.18;
        const lng = Math.sqrt(x * x + y * y + z * z);
        const f = (CONFIG.PROTO_B612.RAYON + n) / lng;
        pos.setXYZ(i, x * f, y * f, z * f);
      }
      geo.computeVertexNormals();
    }
    this.scene.add(
      new THREE.Mesh(
        geo,
        new THREE.MeshToonMaterial({
          color: CONFIG.PALETTE_B612.sol,
          gradientMap: creerRampeAquarelle(),
        }),
      ),
    );
  }

  private construireObjets(): void {
    // Rose
    this.rose = new Rose();
    this.rose.globeActif = true;
    this.poserSurPlanete(this.rose.groupe, new THREE.Vector3(0.25, 1, 0.35));
    const posRose = this.rose.groupe.position.clone();
    this.points.push({
      position: posRose,
      rayon: 1.8,
      type: 'rose',
      action: () => {
        this.journal.ajouter({ id: 'b612_rose', ...LocalizationManager.journal.b612_rose });
        this.dialogueManager.demarrer(dialogueRose);
      },
    });
    this.obstacles.ajouter(posRose, 0.8);

    // Volcans (2 actifs + 1 éteint — détail canonique)
    const configVolcans = [
      { dir: new THREE.Vector3(1, 0.35, 0.2), actif: true, taille: 1.0, id: 'v1' },
      { dir: new THREE.Vector3(-0.6, 0.3, 0.9), actif: true, taille: 0.85, id: 'v2' },
      { dir: new THREE.Vector3(-0.4, 0.2, -1), actif: false, taille: 0.6, id: 'v3' },
    ];
    for (const cv of configVolcans) {
      const v = new Volcan(cv.id, cv.actif, cv.taille);
      this.volcans.push(v);
      this.poserSurPlanete(v.groupe, cv.dir);
      const pv = v.groupe.position.clone();
      this.obstacles.ajouter(pv, 0.7 * cv.taille);
      this.points.push({
        position: pv,
        rayon: 1.5,
        type: 'volcan',
        action: () => {
          if (!v.ramone) {
            v.ramoner();
            this.journal.ajouter({ id: 'b612_volcan', ...LocalizationManager.journal.b612_volcan });
          }
        },
      });
    }

    // Baobabs (3 pousses — « il avait négligé trois arbustes », chap. V)
    const dirBaobabs = [
      new THREE.Vector3(-0.8, 0.6, 0.3),
      new THREE.Vector3(0.5, 0.4, -0.9),
      new THREE.Vector3(-0.3, 0.5, 0.8),
    ];
    dirBaobabs.forEach((dir, i) => {
      const b = new Baobab(`b${i}`, true);
      this.baobabs.push(b);
      this.poserSurPlanete(b.groupe, dir);
      const pb = b.groupe.position.clone();
      this.points.push({
        position: pb,
        rayon: 1.2,
        type: 'baobab',
        action: () => {
          if (!b.arrache) {
            b.arracher();
            this.journal.ajouter({
              id: 'b612_baobabs',
              ...LocalizationManager.journal.b612_baobabs,
            });
          }
        },
      });
    });
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
    if (plusProche) {
      this.boutonInteraction.afficher(libellePourType(plusProche.type));
    } else {
      this.boutonInteraction.masquer();
    }
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
