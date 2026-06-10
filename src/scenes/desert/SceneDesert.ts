import * as THREE from 'three';
import type { ISceneModule } from '../ISceneModule';
import type { ServicesJeu } from '../../core/Services';
import { ChampGravitePlan } from '../../physics/ChampGravite';
import { EnsembleObstacles } from '../../physics/Obstacles';
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
import { Bruit2D } from '../../utilities/Bruit';
import { CONFIG } from '../../configuration/Config';

/**
 * Le désert (jalon M1) — futur hub narratif du jeu.
 *
 * Le terrain est défini par UNE fonction analytique (bruit fractal) qui
 * sert à la fois à générer le maillage visuel et au champ de gravité :
 * le joueur épouse donc exactement le relief, sans maillage de collision.
 */
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
  private controleur: ControleurJoueur | null = null;
  private avatar: AvatarJoueur | null = null;
  private cameraOrbitale: CameraOrbitale | null = null;
  private planeteSuspendue: THREE.Mesh | null = null;
  private tempsLocal = 0;

  // Objets réutilisés à chaque pas (zéro allocation par image).
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

    // Joueur : contrôleur cinématique + avatar provisoire.
    this.controleur = new ControleurJoueur(this.champ, new THREE.Vector3(0, 0, 6), this.obstacles);
    this.avatar = new AvatarJoueur();
    this.scene.add(this.avatar.groupe);

    this.cameraOrbitale = new CameraOrbitale(services.camera.camera, this.champ);
  }

  demarrer(): void {
    if (this.controleur && this.cameraOrbitale) {
      this.cameraOrbitale.reinitialiser(this.controleur.position);
    }
  }

  mettreAJour(dtFixe: number): void {
    if (!this.services || !this.controleur || !this.avatar || !this.cameraOrbitale) return;
    this.tempsLocal += dtFixe;

    // 1. Intention du joueur, lue depuis les entrées consolidées.
    const entrees = this.services.entrees;
    this.commande.axeHorizontal = entrees.axeHorizontal();
    this.commande.axeVertical = entrees.axeVertical();
    this.commande.course = entrees.courseActive();

    // 2. Déplacement relatif à la caméra, puis synchronisation de l'avatar.
    this.cameraOrbitale.obtenirBase(this.baseCamera);
    this.controleur.maj(dtFixe, this.commande, this.baseCamera);
    this.avatar.groupe.position.copy(this.controleur.position);
    this.avatar.groupe.quaternion.copy(this.controleur.orientation);
    this.avatar.animer(dtFixe, this.controleur.vitesseNormalisee);

    // 3. Caméra de suivi.
    this.cameraOrbitale.maj(dtFixe, this.controleur.position, entrees);

    // 4. Vie discrète du décor.
    if (this.planeteSuspendue) {
      this.planeteSuspendue.position.y = 26 + Math.sin(this.tempsLocal * 0.4) * 0.6;
      this.planeteSuspendue.rotation.y += dtFixe * 0.08;
    }
  }

  obtenirScene(): THREE.Scene {
    return this.scene;
  }

  liberer(): void {
    libererScene(this.scene);
  }

  // ---------------------------------------------------------------- privé --

  /** Fonction de hauteur unique : visuel ET physique du terrain. */
  private hauteurTerrain(x: number, z: number): number {
    const reglages = CONFIG.TERRAIN_DESERT;
    return (
      this.bruit.fbm(x * reglages.FREQUENCE, z * reglages.FREQUENCE, reglages.OCTAVES) *
      reglages.AMPLITUDE
    );
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
    const reglages = CONFIG.TERRAIN_DESERT;
    const geometrie = new THREE.PlaneGeometry(
      reglages.TAILLE,
      reglages.TAILLE,
      reglages.SEGMENTS,
      reglages.SEGMENTS,
    );
    geometrie.rotateX(-Math.PI / 2);

    const positions = geometrie.attributes['position'];
    if (positions) {
      for (let i = 0; i < positions.count; i++) {
        positions.setY(i, this.hauteurTerrain(positions.getX(i), positions.getZ(i)));
      }
    }
    geometrie.computeVertexNormals();

    const materiau = new THREE.MeshToonMaterial({
      color: CONFIG.PALETTE_DESERT.sable,
      gradientMap: creerRampeAquarelle(),
    });
    this.scene.add(new THREE.Mesh(geometrie, materiau));
  }

  /** Quelques rochers épars : repères visuels et sensation d'échelle. */
  private construireRochers(): void {
    const geometrie = new THREE.DodecahedronGeometry(1, 0);
    const materiau = new THREE.MeshToonMaterial({
      color: CONFIG.PALETTE_DESERT.roche,
      gradientMap: creerRampeAquarelle(),
    });

    // Placement déterministe (bruit) : le désert est identique à chaque visite.
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2 + this.bruit.valeur(i * 3.1, 0.5) * 0.8;
      const rayon = 24 + Math.abs(this.bruit.valeur(0.3, i * 2.7)) * 95;
      const x = Math.cos(angle) * rayon;
      const z = Math.sin(angle) * rayon;
      const rocher = new THREE.Mesh(geometrie, materiau);
      const echelle = 0.7 + Math.abs(this.bruit.valeur(i * 1.7, i * 0.9)) * 1.6;
      rocher.scale.setScalar(echelle);
      rocher.position.set(x, this.hauteurTerrain(x, z) + echelle * 0.35, z);
      rocher.rotation.set(i * 0.7, i * 1.3, i * 0.4);
      this.scene.add(rocher);
      // Le rocher devient un obstacle : le joueur glisse le long de lui.
      this.obstacles.ajouter(rocher.position, echelle * 0.85);
    }
  }

  private construirePlaneteSuspendue(): void {
    const materiau = new THREE.MeshToonMaterial({
      color: CONFIG.PALETTE_DESERT.planete,
      gradientMap: creerRampeAquarelle([110, 170, 230, 255]),
    });
    this.planeteSuspendue = new THREE.Mesh(new THREE.SphereGeometry(3, 48, 32), materiau);
    this.planeteSuspendue.position.set(-18, 26, -60);
    this.scene.add(this.planeteSuspendue);
  }
}
