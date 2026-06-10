/**
 * Carte des événements du jeu.
 * Chaque entrée associe un nom d'événement à la forme de ses données :
 * le bus (EventBus) garantit ainsi le typage de bout en bout.
 */
export type EvenementsJeu = {
  /** La fenêtre a été redimensionnée. */
  'jeu:redimensionnement': { largeur: number; hauteur: number };

  /** Une scène vient d'être chargée et démarrée. */
  'scene:chargee': { nom: string };
};
