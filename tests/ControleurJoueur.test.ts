import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { ChampGravitePlan, ChampGraviteSpherique } from '../src/physics/ChampGravite';
import { ControleurJoueur } from '../src/characters/joueur/ControleurJoueur';
import { CONFIG } from '../src/configuration/Config';

/** Base caméra fixe pour les tests : avant = -Z, droite = +X. */
const BASE = { avant: new THREE.Vector3(0, 0, -1), droite: new THREE.Vector3(1, 0, 0) };
const DT = 1 / 60;

describe('ControleurJoueur — sol plan', () => {
  it('avance dans la direction de la caméra et reste collé au sol', () => {
    const champ = new ChampGravitePlan(() => 0, 1000);
    const controleur = new ControleurJoueur(champ, new THREE.Vector3(0, 5, 0));

    for (let i = 0; i < 240; i++) {
      controleur.maj(DT, { axeHorizontal: 0, axeVertical: 1, course: false }, BASE);
    }

    expect(controleur.position.z).toBeLessThan(-5); // a bien avancé vers -Z
    expect(controleur.position.y).toBeCloseTo(0, 10); // collé au sol
    expect(controleur.position.x).toBeCloseTo(0, 6); // sans dérive latérale
  });

  it('épouse le relief du terrain pendant le déplacement', () => {
    const champ = new ChampGravitePlan((_x, z) => Math.abs(z) * 0.5, 1000);
    const controleur = new ControleurJoueur(champ, new THREE.Vector3(0, 0, 0));

    for (let i = 0; i < 120; i++) {
      controleur.maj(DT, { axeHorizontal: 0, axeVertical: 1, course: true }, BASE);
    }

    expect(controleur.position.y).toBeCloseTo(Math.abs(controleur.position.z) * 0.5, 10);
  });

  it("court plus vite qu'il ne marche", () => {
    const champ = new ChampGravitePlan(() => 0, 1000);
    const marcheur = new ControleurJoueur(champ, new THREE.Vector3());
    const coureur = new ControleurJoueur(champ, new THREE.Vector3());

    for (let i = 0; i < 180; i++) {
      marcheur.maj(DT, { axeHorizontal: 0, axeVertical: 1, course: false }, BASE);
      coureur.maj(DT, { axeHorizontal: 0, axeVertical: 1, course: true }, BASE);
    }

    expect(Math.abs(coureur.position.z)).toBeGreaterThan(Math.abs(marcheur.position.z) * 1.5);
  });

  it("s'arrête en douceur quand la commande cesse", () => {
    const champ = new ChampGravitePlan(() => 0, 1000);
    const controleur = new ControleurJoueur(champ, new THREE.Vector3());

    for (let i = 0; i < 120; i++) {
      controleur.maj(DT, { axeHorizontal: 0, axeVertical: 1, course: false }, BASE);
    }
    expect(controleur.vitesseNormalisee).toBeGreaterThan(0.3);

    for (let i = 0; i < 180; i++) {
      controleur.maj(DT, { axeHorizontal: 0, axeVertical: 0, course: false }, BASE);
    }
    expect(controleur.vitesseNormalisee).toBeLessThan(0.01);
  });

  it('respecte la limite circulaire du monde', () => {
    const champ = new ChampGravitePlan(() => 0, 3);
    const controleur = new ControleurJoueur(champ, new THREE.Vector3());

    for (let i = 0; i < 600; i++) {
      controleur.maj(DT, { axeHorizontal: 0, axeVertical: 1, course: true }, BASE);
    }
    expect(Math.hypot(controleur.position.x, controleur.position.z)).toBeLessThanOrEqual(3.0001);
  });
});

describe('ControleurJoueur — gravité sphérique (préparation B-612)', () => {
  it('reste à la surface de la planète en marchant longtemps', () => {
    const rayon = 5;
    const champ = new ChampGraviteSpherique(new THREE.Vector3(0, 0, 0), rayon);
    const controleur = new ControleurJoueur(champ, new THREE.Vector3(0, rayon + 2, 0));

    // La base caméra est ré-ancrée au plan tangent comme le ferait la
    // caméra orbitale : on suit simplement la direction de déplacement.
    const base = { avant: new THREE.Vector3(0, 0, -1), droite: new THREE.Vector3(1, 0, 0) };
    const haut = new THREE.Vector3();
    for (let i = 0; i < 1200; i++) {
      controleur.maj(DT, { axeHorizontal: 0, axeVertical: 1, course: true }, base);
      // Ré-ancrage tangent de la base (équivalent du suivi caméra).
      champ.obtenirHaut(controleur.position, haut);
      base.avant.addScaledVector(haut, -base.avant.dot(haut)).normalize();
      base.droite.crossVectors(base.avant, haut).multiplyScalar(-1).normalize();
    }

    // 20 secondes de course : distance parcourue supérieure au périmètre,
    // et le joueur est toujours exactement à la surface.
    expect(controleur.position.length()).toBeCloseTo(rayon, 6);
    const distance = CONFIG.JOUEUR.VITESSE_COURSE * 20;
    expect(distance).toBeGreaterThan(2 * Math.PI * rayon); // il a fait le tour
  });

  it("oriente l'avatar avec un « haut » radial", () => {
    const rayon = 5;
    const champ = new ChampGraviteSpherique(new THREE.Vector3(0, 0, 0), rayon);
    // Départ sur le côté de la planète (+X) : le haut local doit être +X.
    const controleur = new ControleurJoueur(champ, new THREE.Vector3(rayon, 0, 0));

    for (let i = 0; i < 60; i++) {
      controleur.maj(DT, { axeHorizontal: 0, axeVertical: 0, course: false }, BASE);
    }

    const hautAvatar = new THREE.Vector3(0, 1, 0).applyQuaternion(controleur.orientation);
    expect(hautAvatar.x).toBeGreaterThan(0.95); // « debout » sur le flanc de la sphère
  });
});
