import * as THREE from 'three';
import type { ISceneModule } from '../ISceneModule';
import type { ServicesJeu } from '../../core/Services';
import { creerFondDegrade, creerEtoiles } from '../communs/ElementsCiel';
import { libererScene } from '../../utilities/Liberation';
import { creerRampeAquarelle } from '../../shaders/RampeAquarelle';
import { Logger } from '../../utilities/Logger';

/**
 * SceneFinale — chapitres XXV à XXVII du livre (M6).
 *
 * Structure narrative en 4 actes (rythmés par des cliquements sur E) :
 *   1. Le mur de pierre : le Serpent attend.
 *   2. L'ellipse poétique : éclair jaune, chute « comme un arbre, sans bruit ».
 *   3. L'aviateur reste seul. Les étoiles, les grelots.
 *   4. L'épilogue : adresse au lecteur.
 *
 * Pas de joueur contrôlable — c'est une scène cinématique respectueuse
 * du livre, qu'on traverse en avançant le texte. Pas d'image violente :
 * le départ est suggéré par le texte et un fondu vers le ciel étoilé.
 */
export class SceneFinale implements ISceneModule {
  readonly nom = 'finale';

  private readonly scene = new THREE.Scene();
  private services: ServicesJeu | null = null;
  private mur: THREE.Mesh | null = null;
  private silhouette: THREE.Group | null = null;
  private etoiles: THREE.Points | null = null;

  private surfaceTexte: HTMLDivElement | null = null;
  private surfaceOverlay: HTMLDivElement | null = null;
  private etape = 0;
  private tempsLocal = 0;
  private touchEnfoncee = false;
  private surFin: (() => void) | null = null;

  /**
   * Quatre étapes du récit final — reformulations originales.
   */
  private static readonly ETAPES = [
    {
      texte: `Voici venir le huitième jour. Ce soir-là, il marche jusqu'à la vieille muraille de pierre. Là, le serpent jaune l'attend, lové dans le sable.`,
      fondu: 0,
    },
    {
      texte: `« Tu es bon, dit le Petit Prince au serpent. Tu peux me ramener. Je suis lourd, à présent. »`,
      fondu: 0.2,
    },
    {
      texte: `Il y eut, près de sa cheville, un éclair jaune. Il demeura un instant immobile. Il ne cria pas. Il tomba doucement, comme tombe un arbre. Ça ne fit même pas de bruit, à cause du sable.`,
      fondu: 0.7,
    },
    {
      texte: `Et maintenant, quand vous regardez le ciel la nuit, écoutez. Vous entendrez peut-être un rire, comme cinq cents millions de grelots qui se seraient mis à rire à la fois… S'il vous arrive de passer par là, ne vous pressez pas. Attendez un peu, juste sous l'étoile. Et puis, écrivez-moi.`,
      fondu: 1.0,
    },
  ];

  async charger(services: ServicesJeu): Promise<void> {
    this.services = services;

    this.scene.background = creerFondDegrade('#1a2848', '#3a3a6a');
    this.scene.add(
      creerEtoiles({ nombre: 900, rayon: 220, hauteurMinimale: -50, taille: 1.5, opacite: 0.9 }),
    );

    // Mur de pierre stylisé
    const rampe = creerRampeAquarelle();
    const matMur = new THREE.MeshToonMaterial({ color: 0x6a5a48, gradientMap: rampe });
    this.mur = new THREE.Mesh(new THREE.BoxGeometry(8, 1.4, 0.8), matMur);
    this.mur.position.set(0, 0.7, -6);
    this.scene.add(this.mur);

    // Silhouette discrète du Petit Prince (de dos, regardant le mur)
    this.silhouette = new THREE.Group();
    const matSilh = new THREE.MeshToonMaterial({ color: 0xe8c850, gradientMap: rampe });
    const corps = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.21, 0.62, 8), matSilh);
    corps.position.y = 0.42;
    const tete = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), matSilh);
    tete.position.y = 0.92;
    this.silhouette.add(corps, tete);
    this.silhouette.position.set(0, 0, -3);
    this.scene.add(this.silhouette);

    // Lumières
    const lune = new THREE.DirectionalLight(0xe0e8f0, 0.7);
    lune.position.set(-4, 8, 2);
    this.scene.add(lune);
    this.scene.add(new THREE.HemisphereLight(0x88a0c8, 0x1a2030, 0.5));

    // Caméra fixée
    services.camera.camera.position.set(0, 1.6, 2);
    services.camera.camera.lookAt(0, 0.7, -6);

    this.construireUI();
  }

  demarrer(): void {
    this.services?.evenements.emettre('audio:musique', { piste: 'finale', fondu: 4 });
    this.afficherEtape(0);
    Logger.info('Scène finale démarrée.');
  }

  mettreAJour(dtFixe: number): void {
    if (!this.services) return;
    this.tempsLocal += dtFixe;

    // Avancer avec E
    const eEnfoncee = this.services.entrees.estEnfoncee('KeyE');
    if (eEnfoncee && !this.touchEnfoncee) {
      this.touchEnfoncee = true;
      this.avancer();
    }
    if (!eEnfoncee) this.touchEnfoncee = false;

    // À l'étape 3 (ellipse poétique) : la silhouette s'efface progressivement
    if (this.etape >= 2 && this.silhouette) {
      const opacite = Math.max(0, 1 - (this.tempsLocal - this.tempsEntreeEtape) * 0.8);
      this.silhouette.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          const mat = obj.material as THREE.MeshToonMaterial;
          mat.transparent = true;
          mat.opacity = opacite;
        }
      });
      if (opacite <= 0) this.silhouette.visible = false;
    }
  }

  /** Définit le callback exécuté à la toute fin du récit. */
  surTerminer(cb: () => void): void {
    this.surFin = cb;
  }

  obtenirScene(): THREE.Scene {
    return this.scene;
  }

  liberer(): void {
    this.surfaceTexte?.remove();
    this.surfaceOverlay?.remove();
    libererScene(this.scene);
  }

  // ---------------------------------------------------------------- privé

  private tempsEntreeEtape = 0;

  private construireUI(): void {
    this.surfaceOverlay = document.createElement('div');
    this.surfaceOverlay.id = 'finale-overlay';

    this.surfaceTexte = document.createElement('div');
    this.surfaceTexte.id = 'finale-texte';

    const indication = document.createElement('div');
    indication.id = 'finale-indication';
    indication.textContent = 'Appuyez sur E pour continuer';

    this.surfaceOverlay.append(this.surfaceTexte, indication);
    document.body.appendChild(this.surfaceOverlay);
  }

  private afficherEtape(idx: number): void {
    const etape = SceneFinale.ETAPES[idx];
    if (!etape || !this.surfaceTexte || !this.surfaceOverlay) return;

    // Fondu noir progressif sur l'étape 3
    this.surfaceOverlay.style.background = `rgba(20, 24, 40, ${Math.min(0.85, 0.15 + etape.fondu * 0.7)})`;

    this.surfaceTexte.textContent = etape.texte;
    this.surfaceTexte.classList.remove('apparition');
    void this.surfaceTexte.offsetWidth;
    this.surfaceTexte.classList.add('apparition');

    this.tempsEntreeEtape = this.tempsLocal;
  }

  private avancer(): void {
    if (this.etape < SceneFinale.ETAPES.length - 1) {
      this.etape++;
      this.afficherEtape(this.etape);
    } else {
      // Fin du récit : appeler le callback de sortie
      this.surFin?.();
    }
  }
}
