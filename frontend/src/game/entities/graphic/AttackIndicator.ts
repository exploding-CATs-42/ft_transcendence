import type { Point } from "game/@types";
import { Textures } from "game/constants";

export class AttackIndicator extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, position: Point) {
    super(scene, position.x, position.y);
    const icon = this.addIcon(scene);
    this.add(icon);
  }

  // --------------- Utils ---------------

  private addIcon(scene: Phaser.Scene) {
    const icon = scene.add
      .image(0, 0, Textures.attackIcon)
      .setDisplaySize(60, 68);
    return icon;
  }
}
