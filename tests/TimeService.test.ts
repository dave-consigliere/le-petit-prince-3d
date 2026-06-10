import { describe, expect, it } from 'vitest';
import { TimeService } from '../src/engine/TimeService';

describe('TimeService', () => {
  it('accumule le temps total au fil des pas', () => {
    const temps = new TimeService();
    temps.avancer(0.016);
    temps.avancer(0.016);
    expect(temps.tempsTotal).toBeCloseTo(0.032, 5);
    expect(temps.delta).toBeCloseTo(0.016, 5);
  });

  it("met le jeu en pause lorsque l'échelle vaut 0", () => {
    const temps = new TimeService();
    temps.echelle = 0;
    temps.avancer(1);
    expect(temps.tempsTotal).toBe(0);
    expect(temps.delta).toBe(0);
  });

  it('ralentit le temps avec une échelle inférieure à 1', () => {
    const temps = new TimeService();
    temps.echelle = 0.5;
    temps.avancer(1);
    expect(temps.tempsTotal).toBeCloseTo(0.5, 5);
  });

  it('ignore les deltas négatifs (horloge non monotone)', () => {
    const temps = new TimeService();
    temps.avancer(-1);
    expect(temps.tempsTotal).toBe(0);
  });
});
