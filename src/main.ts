/**
 * Point d'entrée de l'application.
 * Toute la logique d'assemblage est déléguée à Bootstrap (core/).
 */
import './style.css';
import { Bootstrap } from './core/Bootstrap';
import { Logger } from './utilities/Logger';

Bootstrap.demarrer().catch((erreur: unknown) => {
  Logger.erreur('Échec du démarrage du jeu.', erreur);
});
