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
import { SceneRoi } from '../scenes/planetes/roi/SceneRoi';
import { SceneVaniteux } from '../scenes/planetes/vaniteux/SceneVaniteux';
import { SceneBuveur } from '../scenes/planetes/buveur/SceneBuveur';
import { SceneBusinessman } from '../scenes/planetes/businessman/SceneBusinessman';
import { SceneAllumeur } from '../scenes/planetes/allumeur/SceneAllumeur';
import { SceneGeographe } from '../scenes/planetes/geographe/SceneGeographe';
import { SceneTerre } from '../scenes/terre/SceneTerre';
import { ProgressionService } from '../game/progression/ProgressionService';
import { SaveManager } from '../save/SaveManager';
import { Journal } from '../game/Journal';
import { CONFIG } from '../configuration/Config';
import { LocalizationManager } from '../localization/LocalizationManager';
import { CartePlanetes } from '../ui/carte/CartePlanetes';
import { Logger } from '../utilities/Logger';

export class Bootstrap {
  static async demarrer(): Promise<void> {
    const conteneur = document.getElementById('application');
    if (!conteneur) throw new Error('Conteneur #application introuvable.');

    const evenements = new EventBus<EvenementsJeu>();
    const audio = new AudioManager(evenements);
    const progression = new ProgressionService(evenements);
    const journal = new Journal(evenements);
    const save = new SaveManager(progression, journal);

    const services: ServicesJeu = {
      evenements,
      temps: new TimeService(),
      entrees: new InputManager(),
      camera: new CameraManager(window.innerWidth, window.innerHeight),
      ressources: new AssetManager(),
      audio,
      progression,
      save,
    };

    // Charger la sauvegarde existante
    const parametres = save.charger();
    if (parametres) {
      audio.volumeMusique = parametres.volumeMusique;
      audio.volumeAmbiance = parametres.volumeAmbiance;
      audio.muet = parametres.muet;
    }

    const rendu = new RendererService(conteneur);
    const scenes = new SceneManager(services);

    // La carte vit ici : elle survit aux changements de scènes ET voit la progression restaurée.
    const carte = new CartePlanetes(progression, LocalizationManager);
    carte.surVoyage((id) => void voyager(id));

    // Déblocage audio
    const debloquerAudio = () => {
      void audio.debloquer();
      window.removeEventListener('pointerdown', debloquerAudio);
      window.removeEventListener('keydown', debloquerAudio);
    };
    window.addEventListener('pointerdown', debloquerAudio);
    window.addEventListener('keydown', debloquerAudio);

    // Fabrique de scènes : desktop → id de scène
    const fabriques: Record<string, () => ISceneModule> = {
      desert: () => new SceneDesert(),
      b612: () => new SceneB612(),
      'planete-roi': () => new SceneRoi(),
      'planete-vaniteux': () => new SceneVaniteux(),
      'planete-buveur': () => new SceneBuveur(),
      'planete-businessman': () => new SceneBusinessman(),
      'planete-allumeur': () => new SceneAllumeur(),
      'planete-geographe': () => new SceneGeographe(),
      terre: () => new SceneTerre(),
    };

    let chargementEnCours = false;
    const voyager = async (destination: string): Promise<void> => {
      if (chargementEnCours) return;
      chargementEnCours = true;
      try {
        const fabrique = fabriques[destination];
        if (!fabrique) {
          Logger.avertissement(`Scène inconnue : ${destination}`);
          return;
        }
        await scenes.chargerScene(fabrique());
        const sc = scenes.scene;
        if (sc) rendu.definirPipeline(sc, services.camera.camera);
      } finally {
        chargementEnCours = false;
      }
    };

    // Démarrage sur le désert
    await voyager('desert');

    // Bascule via touche (outil de dev) ET via la carte des planètes
    // Touches de développement (bascule scènes — retiré en M6)
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Digit1') void voyager('desert');
      if (e.code === 'Digit2') void voyager('b612');
      if (e.code === 'Digit3') void voyager('planete-roi');
      if (e.code === 'Digit4') void voyager('planete-vaniteux');
      if (e.code === 'Digit5') void voyager('planete-buveur');
      if (e.code === 'Digit6') void voyager('planete-businessman');
      if (e.code === 'Digit7') void voyager('planete-allumeur');
      if (e.code === 'Digit8') void voyager('planete-geographe');
      if (e.code === 'Digit9') void voyager('terre');
    });

    // Touche M : écoutée sur document (indépendante du focus du canvas).
    document.addEventListener('keydown', (e) => {
      // KeyM = position physique M (QWERTY), Semicolon = même touche en AZERTY
      if ((e.code !== 'KeyM' && e.code !== 'Semicolon') || e.repeat) return;
      carte.basculer();
    });

    // Événement de voyage déclenché par la CartePlanetes
    evenements.abonner('jeu:voyager', ({ destination }) => {
      void voyager(destination);
    });

    // Sauvegarde automatique toutes les 60 secondes
    setInterval(() => {
      save.sauvegarder({
        volumeMusique: 0.35,
        volumeAmbiance: 0.12,
        muet: audio.muet,
      });
    }, 60_000);

    // Sauvegarde au changement de scène
    evenements.abonner('scene:chargee', () => {
      save.sauvegarder({ volumeMusique: 0.35, volumeAmbiance: 0.12, muet: audio.muet });
    });

    // HUD
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
      (_i, dt) => {
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
      evenements.emettre('jeu:redimensionnement', { largeur: l, hauteur: h });
    });

    boucle.demarrer();
    // Focus automatique sur le canvas : les touches fonctionnent sans clic préalable.
    rendu.obtenirCanvas().focus();
    Logger.info('Le Petit Prince — jalon M3 démarré.');
  }
}
