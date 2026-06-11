import type { EventBus } from '../engine/EventBus';
import type { EvenementsJeu } from '../game/Evenements';
import type { TimeService } from '../engine/TimeService';
import type { InputManager } from '../engine/InputManager';
import type { CameraManager } from '../engine/CameraManager';
import type { AssetManager } from '../engine/AssetManager';
import type { AudioManager } from '../audio/AudioManager';

/**
 * Conteneur des services partagés, injecté dans les scènes et les systèmes.
 * Évite les singletons globaux et facilite les tests (injection de dépendances).
 */
export interface ServicesJeu {
  evenements: EventBus<EvenementsJeu>;
  temps: TimeService;
  entrees: InputManager;
  camera: CameraManager;
  ressources: AssetManager;
  audio: AudioManager;
}
