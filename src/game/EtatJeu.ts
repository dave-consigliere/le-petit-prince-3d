/**
 * États globaux du jeu (machine à états).
 *
 * Chaque état correspond à un mode d'interaction distinct :
 *   - menu      : menu principal, aucune scène 3D ;
 *   - chargement: transition entre deux scènes ;
 *   - jeu       : exploration normale ;
 *   - pause     : Échap pendant l'exploration ;
 *   - parametres: paramètres ouverts depuis le menu principal ou la pause ;
 *   - finale    : séquence de fin (le Serpent, le départ) ;
 *   - epilogue  : générique contemplatif sous les étoiles.
 *
 * La transition se fait via un EventBus : aucun module ne touche
 * directement la machine, ce qui garantit le découplage.
 */
export type EtatJeu =
  | 'menu'
  | 'chargement'
  | 'jeu'
  | 'pause'
  | 'parametres'
  | 'finale'
  | 'epilogue';

export interface TransitionEtat {
  ancien: EtatJeu;
  nouveau: EtatJeu;
}
