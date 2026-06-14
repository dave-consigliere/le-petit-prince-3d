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

  /** Un dialogue vient de commencer. */
  'dialogue:debut': { idPersonnage: string };

  /** Un dialogue vient de se terminer. */
  'dialogue:fin': { idPersonnage: string };

  /** Le joueur a déclenché une interaction (approche d'un objet/personnage). */
  'interaction:declenchee': { id: string };

  /** Une pensée a été ajoutée au journal. */
  'journal:entree': { id: string; titre: string };

  /** Une musique doit changer (crossfade). */
  'audio:musique': { piste: string; fondu: number };

  /** Un nouveau jour narratif commence. */
  'progression:jour': { jour: number };

  /** Un souvenir vient d'être débloqué. */
  'progression:souvenir': { id: string };

  /** Le joueur demande un voyage vers une autre scène. */
  'jeu:voyager': { destination: string };

  /** Un palier d'apprivoisement du Renard a été franchi. */
  'apprivoisement:palier': { etat: string; idEntreeJournal: string };
};
