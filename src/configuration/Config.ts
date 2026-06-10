/**
 * Paramètres globaux du projet (Architecture.md §5 — configuration/).
 * Toute constante « magique » doit être déclarée ici plutôt que dispersée.
 */
export const CONFIG = {
  /** Fréquence des mises à jour logiques, en Hz (boucle à pas fixe). */
  FREQUENCE_MAJ_FIXE: 60,

  /** Ratio de pixels maximal, afin de limiter la charge GPU sur écrans denses. */
  RATIO_PIXELS_MAX: 2,

  /** Palette « aquarelle » de la scène de test (désert au crépuscule doux). */
  PALETTE_DESERT: {
    cielHaut: '#8ec5d6',
    cielBas: '#f6d7a7',
    sable: 0xe9c79b,
    brume: 0xf3d9b1,
    lumiereChaude: 0xfff1da,
    lumiereCiel: 0xbfd9ea,
    lumiereSol: 0xe8c89a,
    planete: 0xd9a7b0,
  },

  /** Intensités du post-traitement « papier aquarelle ». */
  POST_TRAITEMENT: {
    grain: 0.045,
    vignette: 0.35,
  },
} as const;
