import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '../src/engine/EventBus';

interface EvenementsTest extends Record<string, unknown> {
  ping: { valeur: number };
  message: { texte: string };
}

describe('EventBus', () => {
  it('délivre un événement à tous les auditeurs abonnés', () => {
    const bus = new EventBus<EvenementsTest>();
    const auditeurA = vi.fn();
    const auditeurB = vi.fn();
    bus.abonner('ping', auditeurA);
    bus.abonner('ping', auditeurB);

    bus.emettre('ping', { valeur: 42 });

    expect(auditeurA).toHaveBeenCalledWith({ valeur: 42 });
    expect(auditeurB).toHaveBeenCalledWith({ valeur: 42 });
  });

  it('ne délivre pas un événement à un auditeur désabonné', () => {
    const bus = new EventBus<EvenementsTest>();
    const auditeur = vi.fn();
    const desabonner = bus.abonner('message', auditeur);

    desabonner();
    bus.emettre('message', { texte: 'bonjour' });

    expect(auditeur).not.toHaveBeenCalled();
  });

  it("n'envoie un événement qu'aux auditeurs du bon canal", () => {
    const bus = new EventBus<EvenementsTest>();
    const auditeurPing = vi.fn();
    bus.abonner('ping', auditeurPing);

    bus.emettre('message', { texte: 'autre canal' });

    expect(auditeurPing).not.toHaveBeenCalled();
  });

  it('tolère un désabonnement effectué pendant une émission', () => {
    const bus = new EventBus<EvenementsTest>();
    const second = vi.fn();
    const premier = vi.fn(() => bus.desabonner('ping', second));
    bus.abonner('ping', premier);
    bus.abonner('ping', second);

    // Le premier auditeur désabonne le second : aucune erreur ne doit survenir.
    expect(() => bus.emettre('ping', { valeur: 1 })).not.toThrow();
    expect(premier).toHaveBeenCalledOnce();
  });
});
