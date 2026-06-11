import * as THREE from 'three';
import type { ArbreDialogue } from '../../../dialogues/TypesDialogue';
import { ScenePlaneteBase } from '../ScenePlaneteBase';
import { AvatarGeographe } from '../../../characters/geographe/AvatarGeographe';
import { dialogueGeographe } from '../../../dialogues/arbres/dialoguePlanetes';
import { CONFIG } from '../../../configuration/Config';

/**
 * SceneGeographe — planète planete-geographe (chap. X–XV).
 */
export class SceneGeographe extends ScenePlaneteBase {
  override readonly nom = 'planete-geographe';
  override readonly idObjectifProgression = 'visiter_geographe';

  private avatarPnj: AvatarGeographe | null = null;

  constructor() {
    super(CONFIG.PALETTES_PLANETES.geographe);
  }

  protected override async construireDecor(): Promise<void> {
    this.avatarPnj = new AvatarGeographe();
    const pos = this.poserSurPlanete(this.avatarPnj.groupe, new THREE.Vector3(0.3, 1, 0.2));
    this.ajouterInteractionPersonnage(pos);
  }

  protected override obtenirArbreDialogue(): ArbreDialogue {
    return dialogueGeographe;
  }

  protected override animer(dt: number): void {
    this.avatarPnj?.animer(dt);
  }
}
