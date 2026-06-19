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
import { SceneFinale } from '../scenes/finale/SceneFinale';
import { ProgressionService } from '../game/progression/ProgressionService';
import { SaveManager } from '../save/SaveManager';
import { Journal } from '../game/Journal';
import { PreferencesService } from '../game/preferences/PreferencesService';
import { CONFIG } from '../configuration/Config';
import { LocalizationManager } from '../localization/LocalizationManager';
import { CartePlanetes } from '../ui/carte/CartePlanetes';
import { MenuPrincipal } from '../ui/menus/MenuPrincipal';
import { MenuPause } from '../ui/menus/MenuPause';
import { MenuParametres } from '../ui/menus/MenuParametres';
import { EcranChargement } from '../ui/menus/EcranChargement';
import { Livre } from '../ui/livre/Livre';
import { Logger } from '../utilities/Logger';

/**
 * Bootstrap M6 — intègre menu principal, pause, paramètres,
 * écran de chargement, scène finale et progression narrative complète.
 */
export class Bootstrap {
  static async demarrer(): Promise<void> {
    const conteneur = document.getElementById('application');
    if (!conteneur) throw new Error('Conteneur #application introuvable.');

    // -- Services -----------------------------------------------------
    const evenements = new EventBus<EvenementsJeu>();
    const audio = new AudioManager(evenements);
    const progression = new ProgressionService(evenements);
    const journal = new Journal(evenements);
    const save = new SaveManager(progression, journal);
    const preferences = new PreferencesService();
    preferences.charger();

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

    // Appliquer les préférences à l'audio
    const appliquerPrefAudio = () => {
      const p = preferences.preferences;
      audio.volumeMusique = p.volumeMusique;
      audio.volumeAmbiance = p.volumeAmbiance;
      audio.muet = p.muet;
    };
    appliquerPrefAudio();
    preferences.abonner(appliquerPrefAudio);

    // -- Rendu et scènes ---------------------------------------------
    const rendu = new RendererService(conteneur);
    const scenes = new SceneManager(services);

    // -- UI globale ---------------------------------------------------
    const carte = new CartePlanetes(progression, LocalizationManager);
    const ecranChargement = new EcranChargement();
    const menuPrincipal = new MenuPrincipal(save);
    const menuPause = new MenuPause();
    const menuParametres = new MenuParametres(preferences);
    const livre = new Livre(progression);

    // Déblocage audio
    const debloquerAudio = () => {
      void audio.debloquer();
      window.removeEventListener('pointerdown', debloquerAudio);
      window.removeEventListener('keydown', debloquerAudio);
    };
    window.addEventListener('pointerdown', debloquerAudio);
    window.addEventListener('keydown', debloquerAudio);

    // -- Voyage entre scènes -----------------------------------------
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
      finale: () => {
        const f = new SceneFinale();
        f.surTerminer(() => {
          // Fin du jeu : retour menu principal après l'épilogue
          menuPause.fermer();
          partieEnCours = false;
          menuPrincipal.ouvrir();
        });
        return f;
      },
    };

    let chargementEnCours = false;
    let partieEnCours = false;

    const voyager = async (destination: string): Promise<void> => {
      if (chargementEnCours) return;
      chargementEnCours = true;
      ecranChargement.afficher();
      try {
        const fabrique = fabriques[destination];
        if (!fabrique) {
          Logger.avertissement(`Scène inconnue : ${destination}`);
          return;
        }
        // Petite pause pour que le fondu soit visible
        await new Promise((r) => setTimeout(r, 600));
        await scenes.chargerScene(fabrique());
        const sc = scenes.scene;
        if (sc) rendu.definirPipeline(sc, services.camera.camera);
      } finally {
        ecranChargement.masquer();
        chargementEnCours = false;
      }
    };

    carte.surVoyage((id) => void voyager(id));

    // -- Logique de progression : Aviateur déclenche la finale -------
    evenements.abonner('progression:jour', ({ jour }) => {
      if (jour >= 8) {
        // Le jour 8 est le départ — le joueur peut désormais voyager vers la finale
        progression.debloquerSouvenir('finale');
      }
    });

    // -- Menus : connexions logiques ---------------------------------
    const lancerNouvellePartie = async (): Promise<void> => {
      save.effacer();
      progression.restaurer({
        jourActuel: 1,
        joursCompletes: [],
        souvenirsDébloques: ['b612'],
        objectifsRemplis: [],
      });
      // Vider le journal (réinitialisation propre)
      menuPrincipal.fermer();
      partieEnCours = true;
      await voyager('desert');
    };

    const continuerPartie = async (): Promise<void> => {
      const params = save.charger();
      if (params) {
        audio.volumeMusique = params.volumeMusique;
        audio.volumeAmbiance = params.volumeAmbiance;
        audio.muet = params.muet;
      }
      menuPrincipal.fermer();
      partieEnCours = true;
      await voyager('desert');
    };

    menuPrincipal.surNouvellePartie(() => void lancerNouvellePartie());
    menuPrincipal.surContinuer(() => void continuerPartie());
    menuPrincipal.surParametres(() => {
      menuPrincipal.fermer();
      menuParametres.ouvrir();
      menuParametres.surRetour(() => {
        menuParametres.fermer();
        menuPrincipal.ouvrir();
      });
    });

    menuPrincipal.surLivre(() => {
      menuPrincipal.fermer();
      livre.ouvrir(() => menuPrincipal.ouvrir());
    });

    menuPause.surReprendre(() => menuPause.fermer());
    menuPause.surParametres(() => {
      menuPause.fermer();
      menuParametres.ouvrir();
      menuParametres.surRetour(() => {
        menuParametres.fermer();
        menuPause.ouvrir();
      });
    });
    menuPause.surMenuPrincipal(() => {
      // Sauvegarder puis retour
      save.sauvegarder(preferences.preferences);
      menuPause.fermer();
      partieEnCours = false;
      menuPrincipal.ouvrir();
    });

    // -- Touches globales --------------------------------------------
    document.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      // Carte (M ou Semicolon en AZERTY) — uniquement en partie
      if ((e.code === 'KeyM' || e.code === 'Semicolon') && partieEnCours && !menuPause.estOuvert) {
        carte.basculer();
      }
      // Pause (Échap) — uniquement en partie, et bascule
      if (e.code === 'Escape' && partieEnCours) {
        if (menuPause.estOuvert) menuPause.fermer();
        else if (!carte['ouverte' as never]) menuPause.ouvrir();
      }
    });

    // -- Sauvegarde auto ---------------------------------------------
    setInterval(() => {
      if (partieEnCours) save.sauvegarder(preferences.preferences);
    }, 60_000);
    evenements.abonner('scene:chargee', () => {
      if (partieEnCours) save.sauvegarder(preferences.preferences);
    });

    // -- HUD ---------------------------------------------------------
    const hud = document.createElement('div');
    hud.id = 'hud-fps';
    document.body.appendChild(hud);
    const aide = document.createElement('div');
    aide.id = 'hud-aide';
    aide.textContent = LocalizationManager.ui.aide;
    document.body.appendChild(aide);

    // -- Boucle ------------------------------------------------------
    let imgs = 0,
      dur = 0;
    const boucle = new GameLoop(
      CONFIG.FREQUENCE_MAJ_FIXE,
      (dtFixe) => {
        // Pause si menus ouverts (et qu'on est en partie)
        if (partieEnCours && (menuPause.estOuvert || ecranChargement.estAffiche)) return;
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
    rendu.obtenirCanvas().focus();

    // Outils de test (console) — à retirer après validation
    (window as unknown as { __lpp: object }).__lpp = {
      progression,
      save,
      preferences,
      debloquerTout: () => {
        for (const id of [
          'b612',
          'planete-roi',
          'planete-vaniteux',
          'planete-buveur',
          'planete-businessman',
          'planete-allumeur',
          'planete-geographe',
          'terre',
          'finale',
        ]) {
          progression.debloquerSouvenir(id);
        }
        console.log('Toutes les scènes débloquées.');
      },
    };

    Logger.info('Le Petit Prince — jalon M6 démarré.');

    // -- Démarrage : menu principal en premier -----------------------
    menuPrincipal.ouvrir();
  }
}
