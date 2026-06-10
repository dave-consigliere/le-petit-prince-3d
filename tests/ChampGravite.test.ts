import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { ChampGravitePlan, ChampGraviteSpherique } from '../src/physics/ChampGravite';

describe('ChampGravitePlan', () => {
  const champ = new ChampGravitePlan((x, z) => Math.sin(x) + Math.cos(z), 10);

  it('a un « haut » vertical constant', () => {
    const haut = champ.obtenirHaut(new THREE.Vector3(5, 2, -3), new THREE.Vector3());
    expect(haut.x).toBe(0);
    expect(haut.y).toBe(1);
    expect(haut.z).toBe(0);
  });

  it('projette au sol selon la fonction de hauteur', () => {
    const sol = champ.projeterAuSol(new THREE.Vector3(1, 99, 2), new THREE.Vector3());
    expect(sol.y).toBeCloseTo(Math.sin(1) + Math.cos(2), 10);
    expect(sol.x).toBe(1);
    expect(sol.z).toBe(2);
  });

  it('contraint la position au rayon du monde, en glissant le long du bord', () => {
    const position = new THREE.Vector3(30, 0, 40); // distance 50 > rayon 10
    champ.contraindre(position);
    expect(Math.hypot(position.x, position.z)).toBeCloseTo(10, 10);
    // La direction est conservée (glissement, pas de téléportation).
    expect(position.x / position.z).toBeCloseTo(30 / 40, 10);
  });
});

describe('ChampGraviteSpherique', () => {
  const champ = new ChampGraviteSpherique(new THREE.Vector3(0, 0, 0), 5);

  it('a un « haut » radial unitaire', () => {
    const haut = champ.obtenirHaut(new THREE.Vector3(0, 0, 7), new THREE.Vector3());
    expect(haut.length()).toBeCloseTo(1, 10);
    expect(haut.z).toBeCloseTo(1, 10);
  });

  it('projette toute position sur la surface de la planète', () => {
    const sol = champ.projeterAuSol(new THREE.Vector3(3, 8, -2), new THREE.Vector3());
    expect(sol.length()).toBeCloseTo(5, 10);
  });

  it('gère le cas dégénéré du centre exact sans NaN', () => {
    const haut = champ.obtenirHaut(new THREE.Vector3(0, 0, 0), new THREE.Vector3());
    expect(Number.isNaN(haut.x)).toBe(false);
    expect(haut.length()).toBeCloseTo(1, 10);
  });
});
