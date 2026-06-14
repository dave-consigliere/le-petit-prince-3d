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
import { AvatarSerpent } from '../../characters/serpent/AvatarSerpent';
import { AvatarRenard } from '../../characters/renard/AvatarRenard';
import { CameraOrbitale } from '../../engine/CameraOrbitale';
import { creerFondDegrade, creerEtoiles } from '../communs/ElementsCiel';
import { libererScene } from '../../utilities/Liberation';
import { Bruit2D } from '../../utilities/Bruit';
import { Pommier } from './objets/Pommier';
import { Montagne } from './objets/Montagne';
import { JardinRoses } from './objets/RoseTerrestre';
import { ChampDeBle } from './objets/ChampDeBle';
import { Journal } from '../../game/Journal';
import { DialogueManager } from '../../dialogues/DialogueManager';
import {
  dialogueSerpent,
  dialogueRenard,
  dialogueRenardSecret,
} from '../../dialogues/arbres/dialoguesTerre';
import { FenetreDialogue } from '../../ui/FenetreDialogue';
import { FenetreJournal } from '../../ui/FenetreJournal';
import { BoutonInteraction, libellePourType } from '../../ui/BoutonInteraction';
import { JaugeApprivoisement } from '../../ui/JaugeApprivoisement';
import { SystemeApprivoisement } from '../../game/Apprivoisement';
import { LocalizationManager } from '../../localization/LocalizationManager';
import { creerRampeAquarelle } from '../../shaders/RampeAquarelle';
import { CONFIG } from '../../configuration/Config';

interface PointInteraction {
  position: THREE.Vector3;
  rayon: number;
  type: string;
  action: () => void;
}

/**
 * La Terre — chap. XVI à XXVII du livre.
 *
 * Trois zones distinctes dans un même monde :
 *   - le désert d'arrivée (sud-ouest), où se trouve le Serpent ;
 *   - les montagnes (nord), où résonne l'écho ;
 *   - les champs de blé (centre-est), avec le pommier et le Renard ;
 *   - le jardin de 5000 roses (est).
 *
 * Le joueur traverse ces zones librement. La mécanique principale est
 * l'apprivoisement du Renard sous le pommier.
 */
export class SceneTerre implements ISceneModule {
  readonly nom = 'terre';

  private readonly scene = new THREE.Scene();
  private readonly bruit = new Bruit2D(2126); // graine = chap. XXI × 100
  private readonly champ: ChampGravitePlan;
  private readonly obstacles = new EnsembleObstacles();

  private services: ServicesJeu | null = null;
  private controleur: ControleurJoueur | null = null;
  private avatar: AvatarJoueur | null = null;
  private cameraOrbitale: CameraOrbitale | null = null;

  private serpent: AvatarSerpent | null = null;
  private renard: AvatarRenard | null = null;
  private pommier: Pommier | null = null;
  private champBle: ChampDeBle | null = null;

  private apprivoisement!: SystemeApprivoisement;
  private jaugeApprivoisement!: JaugeApprivoisement;
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

  private interactionTouche = false;
  private journalTouche = false;
  private positionRenard = new THREE.Vector3();
  private positionJoueurPrecedente = new THREE.Vector3();
  private secretJoue = false;

  constructor() {
    // Terrain plus vaste que le désert pour accueillir toutes les zones
    this.champ = new ChampGravitePlan((x, z) => this.hauteurTerrain(x, z), 200);
  }

  async charger(services: ServicesJeu): Promise<void> {
    this.services = services;

    this.scene.background = creerFondDegrade(
      CONFIG.PALETTE_TERRE.cielHaut,
      CONFIG.PALETTE_TERRE.cielBas,
    );
    this.scene.fog = new THREE.Fog(CONFIG.PALETTE_TERRE.brume, 70, 300);

    this.construireLumieres();
    this.construireTerrain();
    this.scene.add(
      creerEtoiles({ nombre: 200, rayon: 280, hauteurMinimale: 30, taille: 1.4, opacite: 0.55 }),
    );

    this.placerSerpent();
    this.placerMontagnes();
    this.placerJardinRoses();
    this.placerPommierEtRenard();
    this.placerChampDeBle();

    this.controleur = new ControleurJoueur(this.champ, new THREE.Vector3(0, 0, 6), this.obstacles);
    this.avatar = new AvatarJoueur();
    this.scene.add(this.avatar.groupe);
    this.cameraOrbitale = new CameraOrbitale(services.camera.camera, this.champ);

    this.apprivoisement = new SystemeApprivoisement(services.evenements);
    this.jaugeApprivoisement = new JaugeApprivoisement(this.apprivoisement);

    this.journal = new Journal(services.evenements);
    this.dialogueManager = new DialogueManager(this.journal, services.evenements);
    this.fenetreDialogue = new FenetreDialogue(this.dialogueManager);
    this.fenetreJournal = new FenetreJournal(this.journal);
    this.boutonInteraction = new BoutonInteraction();

    // Entrée de journal d'arrivée + écoute des paliers d'apprivoisement
    this.journal.ajouter({ id: 'terre_arrivee', ...LocalizationManager.journal.terre_arrivee });
    services.evenements.abonner('apprivoisement:palier', ({ idEntreeJournal }) => {
      const entree =
        LocalizationManager.journal[idEntreeJournal as keyof typeof LocalizationManager.journal];
      if (entree) {
        this.journal.ajouter({ id: idEntreeJournal, ...entree });
      }
    });
  }

  demarrer(): void {
    if (this.controleur && this.cameraOrbitale) {
      this.cameraOrbitale.reinitialiser(this.controleur.position);
    }
    this.services?.evenements.emettre('audio:musique', { piste: 'terre', fondu: 3 });
    this.services?.progression.remplirObjectif('rencontrer_renard');
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

    // Animations des objets vivants
    this.serpent?.animer(dtFixe);
    this.pommier?.animer(dtFixe);
    this.champBle?.animer(dtFixe);
    this.renard?.animer(dtFixe);
    if (this.renard) {
      this.renard.regarder(this.avatar.groupe.position);
      this.renard.niveauApprivoisement = this.apprivoisement.suivi.niveau / 4;
    }

    // Mécanique d'apprivoisement
    this.mettreAJourApprivoisement(dtFixe);
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

    this.positionJoueurPrecedente.copy(this.controleur.position);
  }

  obtenirScene(): THREE.Scene {
    return this.scene;
  }

  liberer(): void {
    this.fenetreDialogue.liberer();
    this.fenetreJournal.liberer();
    this.boutonInteraction.liberer();
    this.jaugeApprivoisement.liberer();
    this.champBle?.liberer();
    libererScene(this.scene);
  }

  // ---------------------------------------------------------------- privé

  /** Terrain doux : bruit basse fréquence + plat près du pommier. */
  private hauteurTerrain(x: number, z: number): number {
    // Légères ondulations partout
    const dunes = this.bruit.fbm(x * 0.008, z * 0.008, 3) * 1.6;
    // Plat dans la zone du Renard (rayon 18 autour de (40, 20))
    const dxR = x - 40,
      dzR = z - 20;
    const distRenard = Math.hypot(dxR, dzR);
    const facteurPlat = Math.max(0, 1 - distRenard / 18);
    return dunes * (1 - facteurPlat * 0.95);
  }

  private construireLumieres(): void {
    const soleil = new THREE.DirectionalLight(CONFIG.PALETTE_TERRE.lumiereChaude, 1.4);
    soleil.position.set(-20, 18, -8); // bas dans le ciel = coucher
    this.scene.add(soleil);
    this.scene.add(
      new THREE.HemisphereLight(
        CONFIG.PALETTE_TERRE.lumiereCiel,
        CONFIG.PALETTE_TERRE.lumiereSol,
        0.7,
      ),
    );
  }

  private construireTerrain(): void {
    const geo = new THREE.PlaneGeometry(420, 420, 110, 110);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes['position'];
    if (pos) {
      for (let i = 0; i < pos.count; i++) {
        pos.setY(i, this.hauteurTerrain(pos.getX(i), pos.getZ(i)));
      }
    }
    geo.computeVertexNormals();
    const mat = new THREE.MeshToonMaterial({
      color: CONFIG.PALETTE_TERRE.sable,
      gradientMap: creerRampeAquarelle(),
    });
    this.scene.add(new THREE.Mesh(geo, mat));
  }

  private placerSerpent(): void {
    this.serpent = new AvatarSerpent();
    const x = -25,
      z = -15;
    const y = this.hauteurTerrain(x, z) + 0.02;
    this.serpent.groupe.position.set(x, y, z);
    this.scene.add(this.serpent.groupe);

    this.points.push({
      position: this.serpent.groupe.position.clone(),
      rayon: 3.0,
      type: 'rose',
      action: () => this.dialogueManager.demarrer(dialogueSerpent),
    });
  }

  private placerMontagnes(): void {
    const montagnes = new Montagne();
    const x = -55,
      z = -75;
    const y = this.hauteurTerrain(x, z);
    montagnes.groupe.position.set(x, y, z);
    this.scene.add(montagnes.groupe);

    // Point d'observation déclenchant l'écho
    const point = new THREE.Vector3(x + 8, y, z + 12);
    this.points.push({
      position: point,
      rayon: 4.0,
      type: 'observer',
      action: () => {
        this.journal.ajouter({ id: 'terre_echo', ...LocalizationManager.journal.terre_echo });
      },
    });
  }

  private placerJardinRoses(): void {
    const jardin = new JardinRoses(800, 12);
    const x = 70,
      z = -20;
    const y = this.hauteurTerrain(x, z);
    jardin.groupe.position.set(x, y, z);
    this.scene.add(jardin.groupe);

    this.points.push({
      position: new THREE.Vector3(x, y, z),
      rayon: 8.0,
      type: 'observer',
      action: () => {
        this.journal.ajouter({ id: 'terre_jardin', ...LocalizationManager.journal.terre_jardin });
      },
    });
  }

  private placerPommierEtRenard(): void {
    this.pommier = new Pommier();
    const px = 40,
      pz = 20;
    const py = this.hauteurTerrain(px, pz);
    this.pommier.groupe.position.set(px, py, pz);
    this.scene.add(this.pommier.groupe);
    this.obstacles.ajouter(this.pommier.groupe.position, 0.5); // tronc

    this.renard = new AvatarRenard();
    // Le Renard est à 2m du pommier (sous le pommier, comme dans le livre)
    const rx = px + 1.8,
      rz = pz + 0.5;
    const ry = this.hauteurTerrain(rx, rz);
    this.renard.groupe.position.set(rx, ry, rz);
    this.renard.groupe.rotation.y = -Math.PI / 2;
    this.scene.add(this.renard.groupe);
    this.positionRenard.copy(this.renard.groupe.position);

    // L'interaction E sur le Renard déclenche soit l'accueil, soit le secret final
    this.points.push({
      position: this.positionRenard.clone(),
      rayon: 2.0,
      type: 'rose',
      action: () => {
        if (this.apprivoisement.apprivoiseComplet && !this.secretJoue) {
          this.secretJoue = true;
          this.dialogueManager.demarrer(dialogueRenardSecret);
        } else {
          this.dialogueManager.demarrer(dialogueRenard);
        }
      },
    });
  }

  private placerChampDeBle(): void {
    this.champBle = new ChampDeBle(2000, 16);
    const x = 40,
      z = 20;
    const y = this.hauteurTerrain(x, z);
    this.champBle.groupe.position.set(x, y, z);
    this.scene.add(this.champBle.groupe);
  }

  /** Pilote la mécanique progressive d'apprivoisement. */
  private mettreAJourApprivoisement(dtFixe: number): void {
    if (!this.controleur) return;
    const distance = this.controleur.position.distanceTo(this.positionRenard);
    const immobile = this.controleur.vitesseNormalisee < 0.05;

    // Afficher la jauge si on est dans une distance pertinente
    if (distance < 10 && !this.apprivoisement.apprivoiseComplet) {
      this.apprivoisement.mettreAJour(distance, immobile, dtFixe);
      this.jaugeApprivoisement.afficher();
    } else {
      this.jaugeApprivoisement.masquer();
    }
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
