import type * as THREE from 'three';
import type { ServicesJeu } from '../core/Services';

/**
 * Contrat commun à toutes les scènes du jeu (Architecture.md §10).
 * Chaque planète/lieu est un module indépendant respectant ce cycle de vie :
 * charger → demarrer → mettreAJour (répété) → liberer.
 */
export interface ISceneModule {
  /** Identifiant unique de la scène (utilisé par les événements et la sauvegarde). */
  readonly nom: string;

  /** Charge les ressources de la scène (asynchrone, pendant l'écran de chargement). */
  charger(services: ServicesJeu): Promise<void>;

  /** Démarre la scène une fois chargée (placement caméra, ambiance, musique...). */
  demarrer(): void;

  /** Mise à jour logique, appelée à pas fixe par la boucle de jeu. */
  mettreAJour(dtFixe: number): void;

  /** Expose la scène Three.js à rendre. */
  obtenirScene(): THREE.Scene;

  /** Libère toutes les ressources (géométries, matériaux, textures, écouteurs). */
  liberer(): void;
}
