import * as THREE from 'three';
import type { ArbreDialogue } from '../../../dialogues/TypesDialogue';
import { ScenePlaneteBase } from '../ScenePlaneteBase';
import { AvatarRoi } from '../../../characters/roi/AvatarRoi';
import { dialogueRoi } from '../../../dialogues/arbres/dialoguePlanetes';
import { CONFIG } from '../../../configuration/Config';

/**
 * SceneRoi — planète planete-roi (chap. X–XV).
 */
export class SceneRoi extends ScenePlaneteBase {
  override readonly nom = 'planete-roi';
  override readonly idObjectifProgression = 'visiter_roi';

  private avatarPnj: AvatarRoi | null = null;

  constructor() {
    super(CONFIG.PALETTES_PLANETES.roi);
  }

  protected override async construireDecor(): Promise<void> {
    this.avatarPnj = new AvatarRoi();
    const pos = this.poserSurPlanete(this.avatarPnj.groupe, new THREE.Vector3(0.3, 1, 0.2));
    this.ajouterInteractionPersonnage(pos);
  }

  protected override obtenirArbreDialogue(): ArbreDialogue {
    return dialogueRoi;
  }

  protected override animer(dt: number): void {
    this.avatarPnj?.animer(dt);
  }
}
