import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { Logger } from '../utilities/Logger';

/**
 * Gestionnaire de ressources (Architecture.md §8).
 * - cache mémoire : une ressource n'est jamais chargée deux fois ;
 * - chargement différé : les chargeurs lourds (GLTF/Draco) sont créés à la demande ;
 * - libération : disposition explicite des textures lors des changements de scène.
 */
export class AssetManager {
  private readonly cacheTextures = new Map<string, THREE.Texture>();
  private readonly cacheModeles = new Map<string, GLTF>();
  private readonly chargeurTextures = new THREE.TextureLoader();
  private chargeurGLTF: GLTFLoader | null = null;

  /** Charge une texture (ou la renvoie depuis le cache). */
  async chargerTexture(url: string): Promise<THREE.Texture> {
    const existante = this.cacheTextures.get(url);
    if (existante) return existante;

    const texture = await this.chargeurTextures.loadAsync(url);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cacheTextures.set(url, texture);
    Logger.debogage(`Texture chargée : ${url}`);
    return texture;
  }

  /**
   * Charge un modèle glTF/GLB (ou le renvoie depuis le cache).
   * NOTE (jalon M2) : les fichiers du décodeur Draco devront être copiés
   * dans « public/draco/ » lors de l'intégration des premiers modèles.
   */
  async chargerModele(url: string): Promise<GLTF> {
    const existant = this.cacheModeles.get(url);
    if (existant) return existant;

    if (!this.chargeurGLTF) {
      const draco = new DRACOLoader();
      draco.setDecoderPath('/draco/');
      this.chargeurGLTF = new GLTFLoader();
      this.chargeurGLTF.setDRACOLoader(draco);
    }

    const modele = await this.chargeurGLTF.loadAsync(url);
    this.cacheModeles.set(url, modele);
    Logger.debogage(`Modèle chargé : ${url}`);
    return modele;
  }

  /** Libère toutes les ressources mises en cache. */
  libererTout(): void {
    for (const texture of this.cacheTextures.values()) texture.dispose();
    this.cacheTextures.clear();
    this.cacheModeles.clear();
    Logger.info('Ressources libérées.');
  }
}
