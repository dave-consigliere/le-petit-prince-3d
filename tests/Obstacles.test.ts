import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { EnsembleObstacles } from '../src/physics/Obstacles';
import { ChampGravitePlan } from '../src/physics/ChampGravite';
import { ControleurJoueur } from '../src/characters/joueur/ControleurJoueur';
import { CONFIG } from '../src/configuration/Config';

const HAUT = new THREE.Vector3(0, 1, 0);

describe('EnsembleObstacles', () => {
  it('repousse une position qui pénètre un obstacle', () => {
    const obstacles = new EnsembleObstacles();
    obstacles.ajouter(new THREE.Vector3(0, 0, 0), 1);

    const position = new THREE.Vector3(0.5, 0, 0);
    obstacles.repousser(position, 0.3, HAUT);

    // Distance finale = rayon obstacle + rayon joueur.
    expect(Math.hypot(position.x, position.z)).toBeCloseTo(1.3, 6);
  });

  it('ne touche pas une position hors de portée', () => {
    const obstacles = new EnsembleObstacles();
    obstacles.ajouter(new THREE.Vector3(0, 0, 0), 1);

    const position = new THREE.Vector3(5, 0, 0);
    obstacles.repousser(position, 0.3, HAUT);
    expect(position.x).toBe(5);
  });

  it('ignore la composante verticale (répulsion tangente au sol)', () => {
    const obstacles = new EnsembleObstacles();
    obstacles.ajouter(new THREE.Vector3(0, 0, 0), 1);

    const position = new THREE.Vector3(0.5, 10, 0); // très haut, même axe
    obstacles.repousser(position, 0.3, HAUT);
    expect(position.y).toBe(10); // la hauteur n'est jamais modifiée
    expect(position.x).toBeCloseTo(1.3, 6);
  });
});

describe('ControleurJoueur + obstacles', () => {
  it('ne traverse pas un rocher placé sur son chemin et glisse autour', () => {
    const champ = new ChampGravitePlan(() => 0, 1000);
    const obstacles = new EnsembleObstacles();
    obstacles.ajouter(new THREE.Vector3(0, 0, -5), 1);
    const controleur = new ControleurJoueur(champ, new THREE.Vector3(0.2, 0, 0), obstacles);

    const base = { avant: new THREE.Vector3(0, 0, -1), droite: new THREE.Vector3(1, 0, 0) };
    for (let i = 0; i < 600; i++) {
      controleur.maj(1 / 60, { axeHorizontal: 0, axeVertical: 1, course: true }, base);
    }

    // Jamais à l'intérieur du rocher...
    const distanceAuRocher = Math.hypot(controleur.position.x, controleur.position.z + 5);
    expect(distanceAuRocher).toBeGreaterThanOrEqual(1 + CONFIG.JOUEUR.RAYON_COLLISION - 1e-6);
    // ... et le léger décalage initial l'a fait glisser au-delà de l'obstacle.
    expect(controleur.position.z).toBeLessThan(-6);
  });
});
