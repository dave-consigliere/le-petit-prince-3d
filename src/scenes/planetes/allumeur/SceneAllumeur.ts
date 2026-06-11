import * as THREE from 'three';
import type { ArbreDialogue } from '../../../dialogues/TypesDialogue';
import { ScenePlaneteBase } from '../ScenePlaneteBase';
import { AvatarAllumeur } from '../../../characters/allumeur/AvatarAllumeur';
import { dialogueAllumeur } from '../../../dialogues/arbres/dialoguePlanetes';
import { CONFIG } from '../../../configuration/Config';

/**
 * SceneAllumeur — planète planete-allumeur (chap. X–XV).
 */
export class SceneAllumeur extends ScenePlaneteBase {
  override readonly nom = 'planete-allumeur';
  override readonly idObjectifProgression = 'visiter_allumeur';

  private avatarPnj: AvatarAllumeur | null = null;

  constructor() {
    super(CONFIG.PALETTES_PLANETES.allumeur);
  }

  protected override async construireDecor(): Promise<void> {
    this.avatarPnj = new AvatarAllumeur();
    const pos = this.poserSurPlanete(this.avatarPnj.groupe, new THREE.Vector3(0.3, 1, 0.2));
    this.ajouterInteractionPersonnage(pos);
  }

  protected override obtenirArbreDialogue(): ArbreDialogue {
    return dialogueAllumeur;
  }

  protected override animer(dt: number): void {
    this.avatarPnj?.animer(dt);
  }
}
