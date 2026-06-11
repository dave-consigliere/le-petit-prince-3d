import * as THREE from 'three';
import type { ArbreDialogue } from '../../../dialogues/TypesDialogue';
import { ScenePlaneteBase } from '../ScenePlaneteBase';
import { AvatarBuveur } from '../../../characters/buveur/AvatarBuveur';
import { dialogueBuveur } from '../../../dialogues/arbres/dialoguePlanetes';
import { CONFIG } from '../../../configuration/Config';

/**
 * SceneBuveur — planète planete-buveur (chap. X–XV).
 */
export class SceneBuveur extends ScenePlaneteBase {
  override readonly nom = 'planete-buveur';
  override readonly idObjectifProgression = 'visiter_buveur';

  private avatarPnj: AvatarBuveur | null = null;

  constructor() {
    super(CONFIG.PALETTES_PLANETES.buveur);
  }

  protected override async construireDecor(): Promise<void> {
    this.avatarPnj = new AvatarBuveur();
    const pos = this.poserSurPlanete(this.avatarPnj.groupe, new THREE.Vector3(0.3, 1, 0.2));
    this.ajouterInteractionPersonnage(pos);
  }

  protected override obtenirArbreDialogue(): ArbreDialogue {
    return dialogueBuveur;
  }

  protected override animer(dt: number): void {
    this.avatarPnj?.animer(dt);
  }
}
