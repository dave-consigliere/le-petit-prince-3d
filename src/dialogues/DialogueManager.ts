import type { ArbreDialogue, NœudDialogue, NœudTexte, NœudChoix } from './TypesDialogue';
import type { Journal } from '../game/Journal';
import type { EventBus } from '../engine/EventBus';
import type { EvenementsJeu } from '../game/Evenements';
import { Logger } from '../utilities/Logger';

/** État courant d'une conversation en cours. */
export interface EtatDialogue {
  actif: boolean;
  nœudCourant: NœudDialogue | null;
  /** Personnage qui parle, pour positionner la fenêtre. */
  idPersonnage: string;
}

/**
 * Gestionnaire de dialogues (Architecture.md §5 — dialogues/).
 *
 * Pilote la progression dans un arbre de dialogue, applique les effets
 * (journal, événements), et expose l'état courant à l'UI.
 * Il est découplé de l'affichage : DialogueManager ne touche jamais le DOM.
 */
export class DialogueManager {
  private arbre: ArbreDialogue | null = null;

  readonly etat: EtatDialogue = {
    actif: false,
    nœudCourant: null,
    idPersonnage: '',
  };

  /** Callbacks appelés à chaque changement d'état (pour l'UI). */
  private readonly auditeurs = new Set<() => void>();

  constructor(
    private readonly journal: Journal,
    private readonly evenements: EventBus<EvenementsJeu>,
  ) {}

  /** S'abonne aux changements d'état du dialogue. Retourne le désabonnement. */
  abonner(callback: () => void): () => void {
    this.auditeurs.add(callback);
    return () => this.auditeurs.delete(callback);
  }

  /** Démarre un arbre de dialogue. Sans effet si un dialogue est déjà actif. */
  demarrer(arbre: ArbreDialogue): void {
    if (this.etat.actif) return;
    this.arbre = arbre;
    this.etat.actif = true;
    this.etat.idPersonnage = arbre.idPersonnage;
    this.allerA(arbre.nœudInitial);
    this.evenements.emettre('dialogue:debut', { idPersonnage: arbre.idPersonnage });
  }

  /**
   * Avance d'un cran :
   * - sur un nœud texte : passe au suivant (ou ferme si fin) ;
   * - sur un nœud choix : utiliser choisir() à la place.
   */
  avancer(): void {
    const nœud = this.etat.nœudCourant;
    if (!nœud || !this.etat.actif) return;

    if (nœud.type === 'texte') {
      if (nœud.suivant) {
        this.allerA(nœud.suivant);
      } else {
        this.terminer();
      }
    } else if (nœud.type === 'fin') {
      this.terminer();
    }
  }

  /** Choisit une option sur un nœud de type « choix ». */
  choisir(index: number): void {
    const nœud = this.etat.nœudCourant;
    if (!nœud || nœud.type !== 'choix') return;
    const option = (nœud as NœudChoix).options[index];
    if (!option) return;
    this.allerA(option.cible);
  }

  // ---------------------------------------------------------------- privé --

  private allerA(idNœud: string): void {
    if (!this.arbre) return;
    const nœud = this.arbre.nœuds[idNœud];
    if (!nœud) {
      Logger.erreur(`Nœud de dialogue introuvable : "${idNœud}"`);
      this.terminer();
      return;
    }

    this.etat.nœudCourant = nœud;

    // Application des effets du nœud dès son affichage.
    if (nœud.type === 'texte') {
      for (const effet of (nœud as NœudTexte).effets ?? []) {
        if (effet.type === 'journal') {
          this.appliquerEffetJournal(effet.valeur);
        }
      }
    }

    // Un nœud « fin » est résolu immédiatement.
    if (nœud.type === 'fin') {
      this.terminer();
      return;
    }

    this.notifier();
  }

  private appliquerEffetJournal(idEntree: string): void {
    // Les données viennent du gestionnaire de localisation (importé dynamiquement
    // pour éviter la dépendance circulaire avec fr.ts).
    import('../localization/LocalizationManager')
      .then(({ LocalizationManager }) => {
        const donnees =
          LocalizationManager.journal[idEntree as keyof typeof LocalizationManager.journal];
        if (donnees) {
          this.journal.ajouter({ id: idEntree, titre: donnees.titre, texte: donnees.texte });
        }
      })
      .catch(() => {
        Logger.avertissement(`Entrée journal introuvable : "${idEntree}"`);
      });
  }

  private terminer(): void {
    const idPersonnage = this.etat.idPersonnage;
    this.etat.actif = false;
    this.etat.nœudCourant = null;
    this.etat.idPersonnage = '';
    this.arbre = null;
    this.evenements.emettre('dialogue:fin', { idPersonnage });
    this.notifier();
  }

  private notifier(): void {
    for (const cb of this.auditeurs) cb();
  }
}
