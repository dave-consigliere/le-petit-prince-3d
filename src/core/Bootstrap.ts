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
import { SceneTest } from '../scenes/test/SceneTest';
import { CONFIG } from '../configuration/Config';
import { Logger } from '../utilities/Logger';

/**
 * Point d'assemblage du jeu (Architecture.md §5 — core/).
 * Crée les services, charge la scène initiale et lance la boucle principale.
 */
export class Bootstrap {
  static async demarrer(): Promise<void> {
    const conteneur = document.getElementById('application');
    if (!conteneur) {
      throw new Error('Conteneur « #application » introuvable dans la page.');
    }

    // --- Services partagés (injection de dépendances) ---------------------
    const services: ServicesJeu = {
      evenements: new EventBus<EvenementsJeu>(),
      temps: new TimeService(),
      entrees: new InputManager(),
      camera: new CameraManager(window.innerWidth, window.innerHeight),
      ressources: new AssetManager(),
    };

    const rendu = new RendererService(conteneur);
    const scenes = new SceneManager(services);

    // --- Scène initiale (jalon M0 : scène de test « aquarelle ») ----------
    await scenes.chargerScene(new SceneTest());
    const sceneActive = scenes.scene;
    if (!sceneActive) throw new Error('Aucune scène active après le chargement.');
    rendu.definirPipeline(sceneActive, services.camera.camera);

    // --- Indicateur de performance (outil de développement) ---------------
    const hud = document.createElement('div');
    hud.id = 'hud-fps';
    document.body.appendChild(hud);
    let imagesDepuisMesure = 0;
    let dureeDepuisMesure = 0;

    // --- Boucle principale -------------------------------------------------
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

    // --- Redimensionnement --------------------------------------------------
    window.addEventListener('resize', () => {
      const largeur = window.innerWidth;
      const hauteur = window.innerHeight;
      services.camera.redimensionner(largeur, hauteur);
      rendu.redimensionner(largeur, hauteur);
      services.evenements.emettre('jeu:redimensionnement', { largeur, hauteur });
    });

    boucle.demarrer();
    Logger.info('Le Petit Prince — socle M0 démarré.');
  }
}
