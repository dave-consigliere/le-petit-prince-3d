import type { EventBus } from '../../engine/EventBus';
import type { EvenementsJeu } from '../Evenements';
import { Logger } from '../../utilities/Logger';

/**
 * Service de progression narrative (Plan_initial §4).
 *
 * Huit jours dans le désert, chacun avec ses objectifs.
 * Compléter un jour débloque les souvenirs jouables correspondants.
 */
export interface EtatProgression {
  jourActuel: number;
  joursCompletes: number[];
  souvenirsDébloques: string[];
  objectifsRemplis: string[];
}

export type EvenementProgression =
  | { type: 'jour_avance'; jour: number }
  | { type: 'souvenir_debloque'; id: string }
  | { type: 'objectif_rempli'; id: string };

export class ProgressionService {
  private jourActuelInterne = 1;
  private readonly joursCompletes: number[] = [];
  private readonly souvenirsDébloques: string[] = [];
  private readonly objectifsRemplis = new Set<string>();
  private readonly auditeurs = new Set<(e: EvenementProgression) => void>();

  private readonly objectifsDuJour: Record<number, string[]> = {
    1: ['parler_aviateur_accueil'],
    2: ['observer_etoiles'],
    3: ['parler_aviateur_baobabs', 'visiter_b612'],
    4: ['observer_coucher_soleil'],
    5: ['parler_aviateur_rose'],
    6: [
      'visiter_roi',
      'visiter_vaniteux',
      'visiter_buveur',
      'visiter_businessman',
      'visiter_allumeur',
      'visiter_geographe',
    ],
    7: ['rencontrer_renard'],
    8: ['trouver_puits', 'parler_aviateur_depart'],
  };

  private readonly deblocagesParJour: Record<number, string[]> = {
    1: [],
    2: [],
    3: ['b612'],
    4: [],
    5: [],
    6: [
      'planete-roi',
      'planete-vaniteux',
      'planete-buveur',
      'planete-businessman',
      'planete-allumeur',
      'planete-geographe',
    ],
    7: ['terre'],
    8: [],
  };

  constructor(private readonly evenements: EventBus<EvenementsJeu>) {
    // Jour 1 : B-612 accessible dès le départ pour les tests (à retirer en M6)
    this.souvenirsDébloques.push('b612');
  }

  get jourActuel(): number {
    return this.jourActuelInterne;
  }

  get souvenirs(): readonly string[] {
    return this.souvenirsDébloques;
  }

  estDebloque(id: string): boolean {
    return this.souvenirsDébloques.includes(id);
  }

  remplirObjectif(id: string): void {
    if (this.objectifsRemplis.has(id)) return;
    this.objectifsRemplis.add(id);
    this.notifier({ type: 'objectif_rempli', id });
    Logger.debogage(`Objectif : ${id}`);
    this.verifierJour();
  }

  debloquerSouvenir(id: string): void {
    if (this.souvenirsDébloques.includes(id)) return;
    this.souvenirsDébloques.push(id);
    this.notifier({ type: 'souvenir_debloque', id });
    this.evenements.emettre('progression:souvenir', { id });
  }

  abonner(cb: (e: EvenementProgression) => void): () => void {
    this.auditeurs.add(cb);
    return () => this.auditeurs.delete(cb);
  }

  serialiser(): EtatProgression {
    return {
      jourActuel: this.jourActuelInterne,
      joursCompletes: [...this.joursCompletes],
      souvenirsDébloques: [...this.souvenirsDébloques],
      objectifsRemplis: [...this.objectifsRemplis],
    };
  }

  restaurer(etat: EtatProgression): void {
    this.jourActuelInterne = etat.jourActuel;
    this.joursCompletes.length = 0;
    this.joursCompletes.push(...etat.joursCompletes);
    this.souvenirsDébloques.length = 0;
    this.souvenirsDébloques.push(...etat.souvenirsDébloques);
    this.objectifsRemplis.clear();
    for (const id of etat.objectifsRemplis) this.objectifsRemplis.add(id);
    Logger.info(`Progression restaurée — jour ${this.jourActuelInterne}.`);
  }

  // ---------------------------------------------------------------- privé --

  private verifierJour(): void {
    const objectifs = this.objectifsDuJour[this.jourActuelInterne] ?? [];
    if (objectifs.length === 0) return;
    const tousRemplis = objectifs.every((id) => this.objectifsRemplis.has(id));
    if (tousRemplis && !this.joursCompletes.includes(this.jourActuelInterne)) {
      this.joursCompletes.push(this.jourActuelInterne);
      this.avancerJour();
    }
  }

  private avancerJour(): void {
    if (this.jourActuelInterne >= 8) return;
    this.jourActuelInterne++;
    this.notifier({ type: 'jour_avance', jour: this.jourActuelInterne });
    this.evenements.emettre('progression:jour', { jour: this.jourActuelInterne });
    Logger.info(`Jour ${this.jourActuelInterne}.`);
    for (const id of this.deblocagesParJour[this.jourActuelInterne] ?? []) {
      this.debloquerSouvenir(id);
    }
  }

  private notifier(e: EvenementProgression): void {
    for (const cb of this.auditeurs) cb(e);
  }
}
