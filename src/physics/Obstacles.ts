import * as THREE from 'three';

/**
 * Obstacles minimalistes (Architecture.md — physics/).
 *
 * Philosophie : un jeu contemplatif n'a pas besoin d'un moteur physique
 * généraliste — seulement d'empêcher le joueur de traverser les éléments
 * importants du décor (rochers, puits, avion, personnages...).
 *
 * Modèle : chaque obstacle est un cylindre implicite autour d'un point.
 * La répulsion s'effectue dans le plan tangent au sol (perpendiculaire au
 * « haut » local), ce qui fonctionne aussi bien sur un terrain plan
 * qu'à la surface d'une petite planète. Le joueur GLISSE le long de
 * l'obstacle au lieu de buter : la marche reste fluide et agréable.
 */
export interface ObstacleCylindrique {
  position: THREE.Vector3;
  rayon: number;
}

// Temporaire partagé : zéro allocation par image.
const TMP_DELTA = new THREE.Vector3();

export class EnsembleObstacles {
  private readonly obstacles: ObstacleCylindrique[] = [];

  /** Enregistre un obstacle (la position est copiée). */
  ajouter(position: THREE.Vector3, rayon: number): void {
    this.obstacles.push({ position: position.clone(), rayon });
  }

  /** Nombre d'obstacles enregistrés. */
  get taille(): number {
    return this.obstacles.length;
  }

  /**
   * Repousse une position hors de tous les obstacles pénétrés.
   * @param position position du joueur, modifiée en place ;
   * @param rayonJoueur rayon de la capsule du joueur ;
   * @param haut « haut » local (la répulsion reste tangente au sol).
   */
  repousser(position: THREE.Vector3, rayonJoueur: number, haut: THREE.Vector3): void {
    for (const obstacle of this.obstacles) {
      TMP_DELTA.copy(position).sub(obstacle.position);
      // Projection dans le plan tangent : on ignore la composante verticale.
      TMP_DELTA.addScaledVector(haut, -TMP_DELTA.dot(haut));

      const distance = TMP_DELTA.length();
      const distanceMinimale = obstacle.rayon + rayonJoueur;
      if (distance < distanceMinimale && distance > 1e-6) {
        position.addScaledVector(TMP_DELTA.normalize(), distanceMinimale - distance);
      }
    }
  }
}
