import type { Point } from "game/@types";
import { Textures } from "game/constants";

const ICON_OUTLINE_COLOR = 0xffffff;
const ICON_OUTLINE_OFFSET: Point = { x: 0, y: 3 };
const ICON_OUTLINE_RADIUS = 32;

const ICON_SHADOW_OFFSET: Point = ICON_OUTLINE_OFFSET;
const ICON_SHADOW_RADIUS = 38;

export class AttackIndicator extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, position: Point) {
    super(scene, position.x, position.y);
    const attackIcon = this.addIcon(scene);
    this.add(attackIcon);
  }

  // --------------- Utils ---------------

  private addIcon(scene: Phaser.Scene) {
    const iconContainer = scene.add.container();

    const icon = scene.add
      .image(0, 0, Textures.attackIcon)
      .setDisplaySize(60, 68);

    // Shadow
    const { x: sX, y: sY } = ICON_SHADOW_OFFSET;
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillCircle(sX, sY, ICON_SHADOW_RADIUS);

    // Outline
    const { x: oX, y: oY } = ICON_OUTLINE_OFFSET;
    const outline = scene.add.graphics();
    outline.fillStyle(ICON_OUTLINE_COLOR, 1);
    outline.fillCircle(oX, oY, ICON_OUTLINE_RADIUS);

    iconContainer.add([shadow, outline, icon]);

    return iconContainer;
  }
}
