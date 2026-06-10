import * as THREE from 'three';

/**
 * Abstraction du champ de gravité (préparation de B-612, plan initial §8).
 *
 * Le contrôleur du joueur et la caméra ne connaissent jamais la forme du
 * monde : ils interrogent un champ qui leur fournit le « haut » local et
 * la surface du sol. Marcher sur le désert plat ou autour d'un astéroïde
 * devient ainsi le MÊME code de déplacement.
 *
 * Convention : les méthodes remplissent un vecteur « resultat » fourni par
 * l'appelant, afin d'éviter toute allocation par image (performances).
 */
export interface ChampGravite {
  /** Direction « haut » locale (vecteur unitaire) à une position donnée. */
  obtenirHaut(position: THREE.Vector3, resultat: THREE.Vector3): THREE.Vector3;

  /** Projette une position sur la surface du sol. */
  projeterAuSol(position: THREE.Vector3, resultat: THREE.Vector3): THREE.Vector3;

  /** Contraint la position aux limites du monde (modifie le vecteur en place). */
  contraindre(position: THREE.Vector3): void;
}

/** Fonction de hauteur d'un terrain plan : (x, z) → altitude. */
export type FonctionHauteur = (x: number, z: number) => number;

/**
 * Champ plan : gravité verticale classique, sol défini par une fonction
 * de hauteur analytique. La MÊME fonction génère le maillage visuel :
 * les « collisions » avec le sol sont donc exactes par construction.
 */
export class ChampGravitePlan implements ChampGravite {
  constructor(
    private readonly hauteur: FonctionHauteur,
    private readonly rayonMonde: number,
  ) {}

  obtenirHaut(_position: THREE.Vector3, resultat: THREE.Vector3): THREE.Vector3 {
    return resultat.set(0, 1, 0);
  }

  projeterAuSol(position: THREE.Vector3, resultat: THREE.Vector3): THREE.Vector3 {
    return resultat.set(position.x, this.hauteur(position.x, position.z), position.z);
  }

  /** Limite circulaire douce : on glisse le long du bord, sans mur brutal. */
  contraindre(position: THREE.Vector3): void {
    const distance = Math.hypot(position.x, position.z);
    if (distance > this.rayonMonde && distance > 0) {
      const facteur = this.rayonMonde / distance;
      position.x *= facteur;
      position.z *= facteur;
    }
  }
}

/**
 * Champ sphérique : le « bas » pointe vers le centre de la planète.
 * C'est lui qui permettra de faire le tour de B-612 à pied.
 */
export class ChampGraviteSpherique implements ChampGravite {
  constructor(
    private readonly centre: THREE.Vector3,
    private readonly rayon: number,
  ) {}

  obtenirHaut(position: THREE.Vector3, resultat: THREE.Vector3): THREE.Vector3 {
    resultat.copy(position).sub(this.centre);
    // Cas dégénéré (position exactement au centre) : un haut arbitraire stable.
    if (resultat.lengthSq() < 1e-10) return resultat.set(0, 1, 0);
    return resultat.normalize();
  }

  projeterAuSol(position: THREE.Vector3, resultat: THREE.Vector3): THREE.Vector3 {
    this.obtenirHaut(position, resultat);
    return resultat.multiplyScalar(this.rayon).add(this.centre);
  }

  contraindre(_position: THREE.Vector3): void {
    // Une sphère n'a pas de bord : rien à contraindre.
  }
}
