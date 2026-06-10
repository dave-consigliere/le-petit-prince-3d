import * as THREE from 'three';

/**
 * Gestionnaire de caméra (Architecture.md §6).
 * Au jalon M0 : une caméra perspective unique et la gestion du redimensionnement.
 * Évoluera vers des comportements (suivi 3e personne, cinématiques) au jalon M1.
 */
export class CameraManager {
  readonly camera: THREE.PerspectiveCamera;

  constructor(largeur: number, hauteur: number) {
    this.camera = new THREE.PerspectiveCamera(55, largeur / hauteur, 0.1, 600);
  }

  /** Met à jour la projection après un redimensionnement de la fenêtre. */
  redimensionner(largeur: number, hauteur: number): void {
    this.camera.aspect = largeur / hauteur;
    this.camera.updateProjectionMatrix();
  }
}
