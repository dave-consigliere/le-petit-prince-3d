import { GameLoop } from './GameLoop';
import type { ServicesJeu } from './Services';
import { EventBus } from '../engine/EventBus';
import type { EvenementsJeu } from '../game/Evenements';
import { TimeService } from '../engine/TimeService';
import { InputManager } from '../engine/InputManager';
import { CameraManager } from '../engine/CameraManager';
import { AssetManager } from '../engine/AssetManager';
import { RendererService } from '../engine/RendererService';
import { SceneManager } from '../scenes/SceneManager';
import type { ISceneModule } from '../scenes/ISceneModule';
import { SceneDesert } from '../scenes/desert/SceneDesert';
import { SceneProtoB612 } from '../scenes/b612/SceneProtoB612';
import { CONFIG } from '../configuration/Config';
import { Logger } from '../utilities/Logger';

/**
 * Point d'assemblage du jeu (Architecture.md §5 — core/).
 * Crée les services, charge la scène initiale et lance la boucle principale.
 */
export class Bootstrap {
  /** Fabriques de scènes : chaque bascule crée une instance neuve. */
  private static readonly FABRIQUES_SCENES: Record<string, () => ISceneModule> = {
    Digit1: () => new SceneDesert(),
    Digit2: () => new SceneProtoB612(),
  };

  static async demarrer(): Promise<void> {
    const conteneur = document.getElementById('application');
    if (!conteneur) {
      throw new Error('Conteneur « #application » introuvable dans la page.');
    }

    // --- Services partagés (injection de dépendances) ----------------------
    const services: ServicesJeu = {
      evenements: new EventBus<EvenementsJeu>(),
      temps: new TimeService(),
      entrees: new InputManager(),
      camera: new CameraManager(window.innerWidth, window.innerHeight),
      ressources: new AssetManager(),
    };

    const rendu = new RendererService(conteneur);
    const scenes = new SceneManager(services);

    // --- Chargement d'une scène + reconstruction du pipeline de rendu ------
    let chargementEnCours = false;
    const basculerScene = async (fabrique: () => ISceneModule): Promise<void> => {
      if (chargementEnCours) return;
      chargementEnCours = true;
      try {
        await scenes.chargerScene(fabrique());
        const sceneActive = scenes.scene;
        if (sceneActive) rendu.definirPipeline(sceneActive, services.camera.camera);
      } finally {
        chargementEnCours = false;
      }
    };

    await basculerScene(() => new SceneDesert());

    // --- Bascule de scène (outil de développement du jalon M1) -------------
    // Touches 1 / 2 : permet de vérifier le MÊME contrôleur sur sol plan
    // et en gravité sphérique. Sera remplacé par le voyage entre planètes.
    window.addEventListener('keydown', (evenement) => {
      const fabrique = Bootstrap.FABRIQUES_SCENES[evenement.code];
      if (fabrique) void basculerScene(fabrique);
    });

    // --- HUD de développement (performance + aide) --------------------------
    const hud = document.createElement('div');
    hud.id = 'hud-fps';
    document.body.appendChild(hud);
    const aide = document.createElement('div');
    aide.id = 'hud-aide';
    aide.textContent =
      'ZQSD / WASD / flèches : marcher · Maj : courir · clic gauche : orbiter · molette : zoom · 1 : Désert · 2 : Proto B-612';
    document.body.appendChild(aide);
    let imagesDepuisMesure = 0;
    let dureeDepuisMesure = 0;

    // --- Boucle principale ---------------------------------------------------
    const boucle = new GameLoop(
      CONFIG.FREQUENCE_MAJ_FIXE,
      (dtFixe) => {
        services.temps.avancer(dtFixe);
        scenes.mettreAJour(services.temps.delta);
      },
      (_interpolation, dt) => {
        rendu.rendre(services.temps.tempsTotal);
        imagesDepuisMesure++;
        dureeDepuisMesure += dt;
        if (dureeDepuisMesure >= 0.5) {
          hud.textContent = `${Math.round(imagesDepuisMesure / dureeDepuisMesure)} ips`;
          imagesDepuisMesure = 0;
          dureeDepuisMesure = 0;
        }
      },
    );

    // --- Redimensionnement ---------------------------------------------------
    window.addEventListener('resize', () => {
      const largeur = window.innerWidth;
      const hauteur = window.innerHeight;
      services.camera.redimensionner(largeur, hauteur);
      rendu.redimensionner(largeur, hauteur);
      services.evenements.emettre('jeu:redimensionnement', { largeur, hauteur });
    });

    boucle.demarrer();
    Logger.info('Le Petit Prince — jalon M1 démarré (scène : désert).');
  }
}
