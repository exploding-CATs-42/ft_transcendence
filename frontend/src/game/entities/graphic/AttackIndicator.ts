import type { Point } from "game/@types";
import { Textures } from "game/constants";

const ICON_OUTLINE_COLOR = 0xffffff;
const ICON_OUTLINE_OFFSET: Point = { x: 0, y: 3 };
const ICON_OUTLINE_RADIUS = 32;

export class AttackIndicator extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, position: Point) {
    super(scene, position.x, position.y);
    const icon = this.addIcon(scene);
    this.add(icon);
  }

  // --------------- Utils ---------------

  private addIcon(scene: Phaser.Scene) {
    const iconContainer = scene.add.container();

    const icon = scene.add
      .image(0, 0, Textures.attackIcon)
      .setDisplaySize(60, 68);
    // Outline
    const { x: oX, y: oY } = ICON_OUTLINE_OFFSET;
    const outline = scene.add.graphics();
    outline.fillStyle(ICON_OUTLINE_COLOR, 1);
    outline.fillCircle(oX, oY, ICON_OUTLINE_RADIUS);

    iconContainer.add([outline, icon]);

    return iconContainer;
  }
}
