import { describe, expect, it } from 'vitest';
import { Bruit2D } from '../src/utilities/Bruit';

describe('Bruit2D', () => {
  it('est déterministe : mêmes entrées, mêmes sorties', () => {
    const a = new Bruit2D(612);
    const b = new Bruit2D(612);
    expect(a.valeur(3.7, -1.2)).toBe(b.valeur(3.7, -1.2));
    expect(a.fbm(10.5, 4.2)).toBe(b.fbm(10.5, 4.2));
  });

  it('change de motif avec la graine', () => {
    const a = new Bruit2D(1);
    const b = new Bruit2D(2);
    expect(a.valeur(3.7, -1.2)).not.toBe(b.valeur(3.7, -1.2));
  });

  it('reste borné dans [-1 ; 1]', () => {
    const bruit = new Bruit2D(612);
    for (let i = 0; i < 500; i++) {
      const x = (i * 0.37) % 50;
      const y = (i * 0.91) % 50;
      expect(Math.abs(bruit.valeur(x, y))).toBeLessThanOrEqual(1);
      expect(Math.abs(bruit.fbm(x, y))).toBeLessThanOrEqual(1);
    }
  });

  it('est continu : un petit pas produit une petite variation (terrain lisse)', () => {
    const bruit = new Bruit2D(612);
    for (let i = 0; i < 200; i++) {
      const x = i * 0.173;
      const y = i * 0.291;
      const variation = Math.abs(bruit.fbm(x + 0.001, y) - bruit.fbm(x, y));
      expect(variation).toBeLessThan(0.05);
    }
  });
});
