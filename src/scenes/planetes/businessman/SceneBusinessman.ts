import * as THREE from 'three';
import type { ArbreDialogue } from '../../../dialogues/TypesDialogue';
import { ScenePlaneteBase } from '../ScenePlaneteBase';
import { AvatarBusinessman } from '../../../characters/businessman/AvatarBusinessman';
import { dialogueBusinessman } from '../../../dialogues/arbres/dialoguePlanetes';
import { CONFIG } from '../../../configuration/Config';

/**
 * SceneBusinessman — planète planete-businessman (chap. X–XV).
 */
export class SceneBusinessman extends ScenePlaneteBase {
  override readonly nom = 'planete-businessman';
  override readonly idObjectifProgression = 'visiter_businessman';

  private avatarPnj: AvatarBusinessman | null = null;

  constructor() {
    super(CONFIG.PALETTES_PLANETES.businessman);
  }

  protected override async construireDecor(): Promise<void> {
    this.avatarPnj = new AvatarBusinessman();
    const pos = this.poserSurPlanete(this.avatarPnj.groupe, new THREE.Vector3(0.3, 1, 0.2));
    this.ajouterInteractionPersonnage(pos);
  }

  protected override obtenirArbreDialogue(): ArbreDialogue {
    return dialogueBusinessman;
  }

  protected override animer(dt: number): void {
    this.avatarPnj?.animer(dt);
  }
}
