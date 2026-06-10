/**
 * Bus d'événements fortement typé.
 * Les modules communiquent par événements plutôt que par accès direct,
 * conformément à l'exigence de couplage minimal (Architecture.md §7).
 */
export type Auditeur<TDonnees> = (donnees: TDonnees) => void;

export class EventBus<TCarte extends Record<string, unknown>> {
  /** Table des auditeurs, indexée par nom d'événement. */
  private readonly auditeurs = new Map<keyof TCarte, Set<Auditeur<never>>>();

  /**
   * Abonne un auditeur à un événement.
   * @returns une fonction de désabonnement, pratique pour libérer proprement.
   */
  abonner<K extends keyof TCarte>(evenement: K, auditeur: Auditeur<TCarte[K]>): () => void {
    let ensemble = this.auditeurs.get(evenement);
    if (!ensemble) {
      ensemble = new Set();
      this.auditeurs.set(evenement, ensemble);
    }
    ensemble.add(auditeur as Auditeur<never>);
    return () => this.desabonner(evenement, auditeur);
  }

  /** Désabonne un auditeur précédemment enregistré. */
  desabonner<K extends keyof TCarte>(evenement: K, auditeur: Auditeur<TCarte[K]>): void {
    this.auditeurs.get(evenement)?.delete(auditeur as Auditeur<never>);
  }

  /** Émet un événement de manière synchrone vers tous les auditeurs. */
  emettre<K extends keyof TCarte>(evenement: K, donnees: TCarte[K]): void {
    const ensemble = this.auditeurs.get(evenement);
    if (!ensemble) return;
    // Copie défensive : un auditeur peut se désabonner pendant l'émission.
    for (const auditeur of [...ensemble]) {
      (auditeur as Auditeur<TCarte[K]>)(donnees);
    }
  }

  /** Supprime tous les auditeurs (libération des ressources). */
  toutNettoyer(): void {
    this.auditeurs.clear();
  }
}
