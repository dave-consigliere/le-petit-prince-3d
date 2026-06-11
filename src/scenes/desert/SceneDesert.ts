import * as THREE from 'three';
import type { ISceneModule } from '../ISceneModule';
import type { ServicesJeu } from '../../core/Services';
import { ChampGravitePlan } from '../../physics/ChampGravite';
import { EnsembleObstacles } from '../../physics/Obstacles';
import {
  ControleurJoueur,
  type CommandeDeplacement,
  type BaseCamera,
} from '../../characters/joueur/ControleurJoueur';
import { AvatarJoueur } from '../../characters/joueur/AvatarJoueur';
import { AvatarAviateur } from '../../characters/aviateur/AvatarAviateur';
import { CameraOrbitale } from '../../engine/CameraOrbitale';
import { creerFondDegrade, creerEtoiles } from '../communs/ElementsCiel';
import { libererScene } from '../../utilities/Liberation';
import { Bruit2D } from '../../utilities/Bruit';
import { Avion } from './objets/Avion';
import { Puits } from './objets/Puits';
import { Journal } from '../../game/Journal';
import { DialogueManager } from '../../dialogues/DialogueManager';
import {
  dialogueAviateur_Jour1,
  dialogueAviateur_Jour3,
  dialogueAviateur_Jour8,
} from '../../dialogues/arbres/dialogueAviateur';
import type { ArbreDialogue } from '../../dialogues/TypesDialogue';
import type { ProgressionService } from '../../game/progression/ProgressionService';
import { FenetreDialogue } from '../../ui/FenetreDialogue';
import { FenetreJournal } from '../../ui/FenetreJournal';
import { BoutonInteraction, libellePourType } from '../../ui/BoutonInteraction';
import { LocalizationManager } from '../../localization/LocalizationManager';
import { creerRampeAquarelle } from '../../shaders/RampeAquarelle';
import { CONFIG } from '../../configuration/Config';

interface PointInteraction {
  position: THREE.Vector3;
  rayon: number;
  type: string;
  action: () => void;
}

const TMP_HAUT = new THREE.Vector3();

export class SceneDesert implements ISceneModule {
  readonly nom = 'desert';

  private readonly scene = new THREE.Scene();
  private readonly bruit = new Bruit2D(CONFIG.TERRAIN_DESERT.GRAINE);
  private readonly champ = new ChampGravitePlan(
    (x, z) => this.hauteurTerrain(x, z),
    CONFIG.TERRAIN_DESERT.RAYON_MONDE,
  );
  private readonly obstacles = new EnsembleObstacles();

  private services: ServicesJeu | null = null;
  private progression: ProgressionService | null = null;
  private controleur: ControleurJoueur | null = null;
  private avatar: AvatarJoueur | null = null;
  private avatarAviateur: AvatarAviateur | null = null;
  private cameraOrbitale: CameraOrbitale | null = null;
  private puits: Puits | null = null;
  private planeteSuspendue: THREE.Mesh | null = null;
  private tempsLocal = 0;

  private journal!: Journal;
  private dialogueManager!: DialogueManager;
  private fenetreDialogue!: FenetreDialogue;
  private fenetreJournal!: FenetreJournal;
  private boutonInteraction!: BoutonInteraction;

  private readonly points: PointInteraction[] = [];
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
    this.progression = services.progression;

    this.scene.background = creerFondDegrade(
      CONFIG.PALETTE_DESERT.cielHaut,
      CONFIG.PALETTE_DESERT.cielBas,
    );
    this.scene.fog = new THREE.Fog(CONFIG.PALETTE_DESERT.brume, 45, 240);

    this.construireLumieres();
    this.construireTerrain();
    this.construireRochers();
    this.construirePlaneteSuspendue();
    this.scene.add(
      creerEtoiles({ nombre: 400, rayon: 250, hauteurMinimale: 14, taille: 1.6, opacite: 0.85 }),
    );

    this.placerAvion();
    this.placerPuits();
    this.placerAviateur();

    this.controleur = new ControleurJoueur(this.champ, new THREE.Vector3(0, 0, 6), this.obstacles);
    this.avatar = new AvatarJoueur();
    this.scene.add(this.avatar.groupe);
    this.cameraOrbitale = new CameraOrbitale(services.camera.camera, this.champ);

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
    this.services?.evenements.emettre('audio:musique', { piste: 'desert', fondu: 2 });
  }

  mettreAJour(dtFixe: number): void {
    if (!this.services || !this.controleur || !this.avatar || !this.cameraOrbitale) return;
    this.tempsLocal += dtFixe;

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
    this.avatarAviateur?.animer(dtFixe);
    this.puits?.animer(dtFixe);
    this.cameraOrbitale.maj(dtFixe, this.controleur.position, entrees);

    if (this.planeteSuspendue) {
      this.planeteSuspendue.position.y = 26 + Math.sin(this.tempsLocal * 0.4) * 0.6;
      this.planeteSuspendue.rotation.y += dtFixe * 0.08;
    }

    this.mettreAJourInteraction();

    // Touches
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

  // ---------------------------------------------------------------- privé --

  private hauteurTerrain(x: number, z: number): number {
    const r = CONFIG.TERRAIN_DESERT;
    return this.bruit.fbm(x * r.FREQUENCE, z * r.FREQUENCE, r.OCTAVES) * r.AMPLITUDE;
  }

  private construireLumieres(): void {
    const soleil = new THREE.DirectionalLight(CONFIG.PALETTE_DESERT.lumiereChaude, 1.4);
    soleil.position.set(14, 24, 12);
    this.scene.add(soleil);
    this.scene.add(
      new THREE.HemisphereLight(
        CONFIG.PALETTE_DESERT.lumiereCiel,
        CONFIG.PALETTE_DESERT.lumiereSol,
        0.65,
      ),
    );
  }

  private construireTerrain(): void {
    const r = CONFIG.TERRAIN_DESERT;
    const geo = new THREE.PlaneGeometry(r.TAILLE, r.TAILLE, r.SEGMENTS, r.SEGMENTS);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes['position'];
    if (pos) {
      for (let i = 0; i < pos.count; i++) {
        pos.setY(i, this.hauteurTerrain(pos.getX(i), pos.getZ(i)));
      }
    }
    geo.computeVertexNormals();
    this.scene.add(
      new THREE.Mesh(
        geo,
        new THREE.MeshToonMaterial({
          color: CONFIG.PALETTE_DESERT.sable,
          gradientMap: creerRampeAquarelle(),
        }),
      ),
    );
  }

  private construireRochers(): void {
    const geo = new THREE.DodecahedronGeometry(1, 0);
    const mat = new THREE.MeshToonMaterial({
      color: CONFIG.PALETTE_DESERT.roche,
      gradientMap: creerRampeAquarelle(),
    });
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2 + this.bruit.valeur(i * 3.1, 0.5) * 0.8;
      const rayon = 24 + Math.abs(this.bruit.valeur(0.3, i * 2.7)) * 95;
      const x = Math.cos(angle) * rayon;
      const z = Math.sin(angle) * rayon;
      const rocher = new THREE.Mesh(geo, mat);
      const echelle = 0.7 + Math.abs(this.bruit.valeur(i * 1.7, i * 0.9)) * 1.6;
      rocher.scale.setScalar(echelle);
      rocher.position.set(x, this.hauteurTerrain(x, z) + echelle * 0.35, z);
      rocher.rotation.set(i * 0.7, i * 1.3, i * 0.4);
      this.scene.add(rocher);
      this.obstacles.ajouter(rocher.position, echelle * 0.85);
    }
  }

  private construirePlaneteSuspendue(): void {
    const mat = new THREE.MeshToonMaterial({
      color: CONFIG.PALETTE_DESERT.planete,
      gradientMap: creerRampeAquarelle([110, 170, 230, 255]),
    });
    this.planeteSuspendue = new THREE.Mesh(new THREE.SphereGeometry(3, 48, 32), mat);
    this.planeteSuspendue.position.set(-18, 26, -60);
    this.scene.add(this.planeteSuspendue);
  }

  private placerAvion(): void {
    const avion = new Avion();
    const x = -12,
      z = -18;
    avion.groupe.position.set(x, this.hauteurTerrain(x, z) + 0.1, z);
    this.scene.add(avion.groupe);
    this.obstacles.ajouter(avion.groupe.position, 2.2);
    // L'avion peut être « inspecté » (entrée journal sur l'origine du voyage)
    this.points.push({
      position: avion.groupe.position.clone(),
      rayon: 3.5,
      type: 'observer',
      action: () => {
        this.journal.ajouter({
          id: 'desert_avion',
          titre: "L'avion en panne",
          texte:
            "C'est là que tout a commencé. Une panne au milieu du désert, à mille milles de tout.",
        });
      },
    });
  }

  private placerPuits(): void {
    const px = 8,
      pz = 12;
    const py = this.hauteurTerrain(px, pz);
    this.puits = new Puits();
    this.puits.groupe.position.set(px, py, pz);
    this.scene.add(this.puits.groupe);
    this.obstacles.ajouter(this.puits.groupe.position, 1.0);
    this.points.push({
      position: this.puits.groupe.position.clone(),
      rayon: 2.5,
      type: 'observer',
      action: () => {
        this.journal.ajouter({ id: 'desert_puits', ...LocalizationManager.journal.desert_puits });
        this.progression?.remplirObjectif('trouver_puits');
      },
    });
  }

  private placerAviateur(): void {
    const ax = -9,
      az = -14;
    const ay = this.hauteurTerrain(ax, az);
    this.avatarAviateur = new AvatarAviateur();
    this.avatarAviateur.groupe.position.set(ax, ay, az);
    this.avatarAviateur.groupe.rotation.y = 0.8;
    this.scene.add(this.avatarAviateur.groupe);
    this.obstacles.ajouter(this.avatarAviateur.groupe.position, 1.0);

    this.points.push({
      position: this.avatarAviateur.groupe.position.clone(),
      rayon: 2.8,
      type: 'rose', // réutilise l'icône « parler »
      action: () => {
        const arbre = this.choisirDialogueAviateur();
        this.dialogueManager.demarrer(arbre);
        this.progression?.remplirObjectif('parler_aviateur_accueil');
      },
    });
  }

  private choisirDialogueAviateur(): ArbreDialogue {
    const jour = this.progression?.jourActuel ?? 1;
    if (jour >= 8) return dialogueAviateur_Jour8;
    if (jour >= 3) return dialogueAviateur_Jour3;
    return dialogueAviateur_Jour1;
  }

  private mettreAJourInteraction(): void {
    if (!this.controleur || this.dialogueManager.etat.actif) {
      this.boutonInteraction.masquer();
      return;
    }
    let plusProche: PointInteraction | null = null;
    let distMin = Infinity;
    this.champ.obtenirHaut(this.controleur.position, TMP_HAUT);
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
