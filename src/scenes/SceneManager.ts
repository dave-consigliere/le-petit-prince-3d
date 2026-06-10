import type * as THREE from 'three';
import type { ISceneModule } from './ISceneModule';
import type { ServicesJeu } from '../core/Services';
import { Logger } from '../utilities/Logger';

/**
 * Gestionnaire de scènes (Architecture.md §6 et §10).
 * Garantit qu'une seule scène est active et que la précédente est
 * intégralement libérée avant tout changement.
 */
export class SceneManager {
  private sceneActive: ISceneModule | null = null;

  constructor(private readonly services: ServicesJeu) {}

  /** Charge, active et démarre une scène ; libère la précédente. */
  async chargerScene(module: ISceneModule): Promise<void> {
    if (this.sceneActive) {
      Logger.info(`Libération de la scène « ${this.sceneActive.nom} ».`);
      this.sceneActive.liberer();
      this.sceneActive = null;
    }

    Logger.info(`Chargement de la scène « ${module.nom} »...`);
    await module.charger(this.services);
    this.sceneActive = module;
    module.demarrer();
    this.services.evenements.emettre('scene:chargee', { nom: module.nom });
    Logger.info(`Scène « ${module.nom} » démarrée.`);
  }

  /** Délègue la mise à jour logique à la scène active. */
  mettreAJour(dtFixe: number): void {
    this.sceneActive?.mettreAJour(dtFixe);
  }

  /** Scène Three.js active, ou null si aucune. */
  get scene(): THREE.Scene | null {
    return this.sceneActive?.obtenirScene() ?? null;
  }
}
