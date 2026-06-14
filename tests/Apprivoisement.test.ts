import { describe, expect, it } from 'vitest';
import { EventBus } from '../src/engine/EventBus';
import type { EvenementsJeu } from '../src/game/Evenements';
import { SystemeApprivoisement } from '../src/game/Apprivoisement';

function creer() {
  const bus = new EventBus<EvenementsJeu>();
  return { bus, sys: new SystemeApprivoisement(bus) };
}

describe('SystemeApprivoisement', () => {
  it('démarre étranger au niveau 0', () => {
    const { sys } = creer();
    expect(sys.suivi.etat).toBe('etranger');
    expect(sys.suivi.niveau).toBe(0);
  });

  it('progresse en restant immobile dans la zone du premier palier', () => {
    const { sys } = creer();
    // Distance 6 (< 8 du palier curieux), immobile, 3s
    for (let i = 0; i < 200; i++) sys.mettreAJour(6, true, 1 / 60);
    expect(sys.suivi.niveau).toBe(1);
    expect(sys.suivi.etat).toBe('curieux');
  });

  it("régresse quand on s'éloigne", () => {
    const { sys } = creer();
    // Accumuler un peu de temps puis s'éloigner
    for (let i = 0; i < 60; i++) sys.mettreAJour(6, true, 1 / 60);
    const tempsAvant = sys.suivi.tempsImmobile;
    for (let i = 0; i < 60; i++) sys.mettreAJour(20, true, 1 / 60);
    expect(sys.suivi.tempsImmobile).toBeLessThan(tempsAvant);
  });

  it('régresse moins fort si on est immobile mais hors zone', () => {
    const { sys } = creer();
    for (let i = 0; i < 60; i++) sys.mettreAJour(6, true, 1 / 60);
    const t0 = sys.suivi.tempsImmobile;
    sys.mettreAJour(20, true, 1);
    expect(sys.suivi.tempsImmobile).toBeCloseTo(t0 - 0.5, 1);
  });

  it("marque l'apprivoisement complet à 4 paliers", () => {
    const { sys } = creer();
    sys.forcerNiveau(4);
    expect(sys.apprivoiseComplet).toBe(true);
    expect(sys.suivi.etat).toBe('ami');
  });

  it('ne progresse pas si le joueur court', () => {
    const { sys } = creer();
    for (let i = 0; i < 200; i++) sys.mettreAJour(6, false, 1 / 60);
    expect(sys.suivi.niveau).toBe(0);
  });
});
