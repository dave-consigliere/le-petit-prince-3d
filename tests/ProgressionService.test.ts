import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '../src/engine/EventBus';
import type { EvenementsJeu } from '../src/game/Evenements';
import { ProgressionService } from '../src/game/progression/ProgressionService';

function creerProgression() {
  const bus = new EventBus<EvenementsJeu>();
  return { bus, progression: new ProgressionService(bus) };
}

describe('ProgressionService', () => {
  it('démarre au jour 1', () => {
    const { progression } = creerProgression();
    expect(progression.jourActuel).toBe(1);
  });

  it(`avance au jour 2 quand l'objectif du jour 1 est rempli`, () => {
    const { progression } = creerProgression();
    progression.remplirObjectif('parler_aviateur_accueil');
    expect(progression.jourActuel).toBe(2);
  });

  it(`ne compte pas deux fois le même objectif`, () => {
    const { progression } = creerProgression();
    progression.remplirObjectif('parler_aviateur_accueil');
    progression.remplirObjectif('parler_aviateur_accueil');
    expect(progression.jourActuel).toBe(2);
  });

  it('débloque B-612 au passage au jour 3', () => {
    const { progression } = creerProgression();
    progression.remplirObjectif('parler_aviateur_accueil'); // → jour 2
    progression.remplirObjectif('observer_etoiles'); // → jour 3
    expect(progression.estDebloque('b612')).toBe(true);
  });

  it(`sérialise et restaure fidèlement`, () => {
    const { progression } = creerProgression();
    progression.remplirObjectif('parler_aviateur_accueil');
    const snap = progression.serialiser();

    const { progression: p2 } = creerProgression();
    p2.restaurer(snap);
    expect(p2.jourActuel).toBe(snap.jourActuel);
    expect(p2.estDebloque('b612')).toBe(progression.estDebloque('b612'));
  });

  it(`notifie les abonnés à chaque objectif rempli`, () => {
    const { progression } = creerProgression();
    const cb = vi.fn();
    progression.abonner(cb);
    progression.remplirObjectif('parler_aviateur_accueil');
    expect(cb).toHaveBeenCalledWith(expect.objectContaining({ type: 'objectif_rempli' }));
  });
});
