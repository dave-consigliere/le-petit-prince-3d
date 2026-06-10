import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { creerRampeAquarelle } from '../src/shaders/RampeAquarelle';

describe('creerRampeAquarelle', () => {
  it('crée une texture 1D de la largeur demandée', () => {
    const rampe = creerRampeAquarelle([50, 150, 250]);
    expect(rampe.image.width).toBe(3);
    expect(rampe.image.height).toBe(1);
  });

  it('utilise un filtrage linéaire (transitions douces, style lavis)', () => {
    const rampe = creerRampeAquarelle();
    expect(rampe.minFilter).toBe(THREE.LinearFilter);
    expect(rampe.magFilter).toBe(THREE.LinearFilter);
    // « needsUpdate » est un setter pur dans Three.js : il incrémente « version ».
    expect(rampe.version).toBeGreaterThanOrEqual(1);
  });
});
