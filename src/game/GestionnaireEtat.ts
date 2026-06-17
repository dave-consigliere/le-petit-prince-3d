import type { EventBus } from '../engine/EventBus';
import type { EvenementsJeu } from './Evenements';
import type { EtatJeu, TransitionEtat } from './EtatJeu';
import { Logger } from '../utilities/Logger';

/**
 * Machine à états du jeu — orchestre toutes les transitions globales.
 *
 * Règle : on ne peut pas passer de n'importe quel état à n'importe quel autre.
 * Par exemple, on ne peut pas mettre en pause depuis le menu principal.
 * Les transitions interdites sont silencieusement ignorées avec un avertissement.
 */
export class GestionnaireEtat {
  private etatCourantInterne: EtatJeu = 'menu';

  /** Transitions autorisées : état actuel → ensemble d'états cibles valides. */
  private static readonly TRANSITIONS: Record<EtatJeu, EtatJeu[]> = {
    menu: ['chargement', 'parametres'],
    chargement: ['jeu', 'finale'],
    jeu: ['pause', 'chargement', 'finale'],
    pause: ['jeu', 'menu', 'parametres'],
    parametres: ['menu', 'pause'],
    finale: ['epilogue'],
    epilogue: ['menu'],
  };

  constructor(private readonly evenements: EventBus<EvenementsJeu>) {
    this.evenements.abonner('etat:demande', ({ vers }) => {
      this.transitionnerVers(vers as EtatJeu);
    });
  }

  get etat(): EtatJeu {
    return this.etatCourantInterne;
  }

  /** Force une transition (à utiliser via 'etat:demande' en pratique). */
  transitionnerVers(vers: EtatJeu): boolean {
    const ancien = this.etatCourantInterne;
    const cibles = GestionnaireEtat.TRANSITIONS[ancien] ?? [];

    if (!cibles.includes(vers)) {
      Logger.avertissement(`Transition refusée : ${ancien} → ${vers}`);
      return false;
    }

    const transition: TransitionEtat = { ancien, nouveau: vers };
    this.etatCourantInterne = vers;
    Logger.info(`État : ${ancien} → ${vers}`);
    this.evenements.emettre('etat:change', {
      ancien: transition.ancien,
      nouveau: transition.nouveau,
    });
    return true;
  }
}
