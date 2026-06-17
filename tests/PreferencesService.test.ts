import { describe, expect, it, beforeEach, vi } from 'vitest';
import { PreferencesService } from '../src/game/preferences/PreferencesService';

describe('PreferencesService', () => {
  beforeEach(() => {
    // Mock minimal de localStorage et document
    const stockage: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => stockage[k] ?? null,
      setItem: (k: string, v: string) => {
        stockage[k] = v;
      },
      removeItem: (k: string) => {
        delete stockage[k];
      },
    });
    vi.stubGlobal('document', {
      body: {
        classList: { add: () => undefined, remove: () => undefined, toggle: () => undefined },
      },
    });
  });

  it('démarre avec les valeurs par défaut', () => {
    const p = new PreferencesService();
    expect(p.preferences.muet).toBe(false);
    expect(p.preferences.tailleTexte).toBe('normal');
  });

  it('modifie une préférence et la persiste', () => {
    const p = new PreferencesService();
    p.modifier('volumeMusique', 0.7);
    expect(p.preferences.volumeMusique).toBe(0.7);
    const p2 = new PreferencesService();
    p2.charger();
    expect(p2.preferences.volumeMusique).toBe(0.7);
  });

  it('réinitialise aux valeurs par défaut', () => {
    const p = new PreferencesService();
    p.modifier('muet', true);
    p.modifier('tailleTexte', 'grand');
    p.reinitialiser();
    expect(p.preferences.muet).toBe(false);
    expect(p.preferences.tailleTexte).toBe('normal');
  });

  it('notifie les abonnés à chaque changement', () => {
    const p = new PreferencesService();
    const cb = vi.fn();
    p.abonner(cb);
    p.modifier('volumeMusique', 0.5);
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
