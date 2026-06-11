import { GameLoop } from './GameLoop';
import type { ServicesJeu } from './Services';
import { EventBus } from '../engine/EventBus';
import type { EvenementsJeu } from '../game/Evenements';
import { TimeService } from '../engine/TimeService';
import { InputManager } from '../engine/InputManager';
import { CameraManager } from '../engine/CameraManager';
import { AssetManager } from '../engine/AssetManager';
import { AudioManager } from '../audio/AudioManager';
import { RendererService } from '../engine/RendererService';
import { SceneManager } from '../scenes/SceneManager';
import type { ISceneModule } from '../scenes/ISceneModule';
import { SceneDesert } from '../scenes/desert/SceneDesert';
import { SceneB612 } from '../scenes/b612/SceneB612';
import { CONFIG } from '../configuration/Config';
import { LocalizationManager } from '../localization/LocalizationManager';
import { Logger } from '../utilities/Logger';

export class Bootstrap {
  private static readonly FABRIQUES: Record<string, () => ISceneModule> = {
    Digit1: () => new SceneDesert(),
    Digit2: () => new SceneB612(),
  };

  static async demarrer(): Promise<void> {
    const conteneur = document.getElementById('application');
    if (!conteneur) throw new Error('Conteneur #application introuvable.');

    const evenements = new EventBus<EvenementsJeu>();
    const audio = new AudioManager(evenements);

    const services: ServicesJeu = {
      evenements,
      temps: new TimeService(),
      entrees: new InputManager(),
      camera: new CameraManager(window.innerWidth, window.innerHeight),
      ressources: new AssetManager(),
      audio,
    };

    const rendu = new RendererService(conteneur);
    const scenes = new SceneManager(services);

    // Déblocage audio au premier geste utilisateur (politique navigateurs).
    // debloquer() est async : la piste en attente est jouée après le resume().
    const debloquerAudio = () => {
      void audio.debloquer();
      window.removeEventListener('pointerdown', debloquerAudio);
      window.removeEventListener('keydown', debloquerAudio);
    };
    window.addEventListener('pointerdown', debloquerAudio);
    window.addEventListener('keydown', debloquerAudio);

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

    // Bascule de scènes (développement + futur voyage interplanétaire)
    window.addEventListener('keydown', (e) => {
      const fab = Bootstrap.FABRIQUES[e.code];
      if (fab) void basculerScene(fab);
    });

    // HUD de développement
    const hud = document.createElement('div');
    hud.id = 'hud-fps';
    document.body.appendChild(hud);
    const aide = document.createElement('div');
    aide.id = 'hud-aide';
    aide.textContent = LocalizationManager.ui.aide;
    document.body.appendChild(aide);

    let imgs = 0,
      dur = 0;

    const boucle = new GameLoop(
      CONFIG.FREQUENCE_MAJ_FIXE,
      (dtFixe) => {
        services.temps.avancer(dtFixe);
        scenes.mettreAJour(services.temps.delta);
      },
      (_interp, dt) => {
        const sc = scenes.scene;
        if (sc) rendu.rendre(services.temps.tempsTotal, sc, services.camera.camera);
        imgs++;
        dur += dt;
        if (dur >= 0.5) {
          hud.textContent = `${Math.round(imgs / dur)} ips`;
          imgs = 0;
          dur = 0;
        }
      },
    );

    window.addEventListener('resize', () => {
      const l = window.innerWidth,
        h = window.innerHeight;
      services.camera.redimensionner(l, h);
      rendu.redimensionner(l, h);
      services.evenements.emettre('jeu:redimensionnement', { largeur: l, hauteur: h });
    });

    boucle.demarrer();
    Logger.info('Le Petit Prince — jalon M2 démarré.');
  }
}
