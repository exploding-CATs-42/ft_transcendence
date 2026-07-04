import type { Point } from "game/@types";
import { Textures } from "game/constants";

const ICON_OUTLINE_COLOR = 0xffffff;
const ICON_OUTLINE_OFFSET: Point = { x: 0, y: 3 };
const ICON_OUTLINE_RADIUS = 32;

const ICON_SHADOW_OFFSET: Point = ICON_OUTLINE_OFFSET;
const ICON_SHADOW_RADIUS = 38;

const BADGE_COLOR = 0xad0003;
const BADGE_OFFSET: Point = { x: 26, y: -20 };
const BADGE_RADIUS = 17;
const BADGE_TEXT_COLOR = "#ffffff";

const BADGE_SHADOW_OFFSET: Point = { x: -1, y: 3 };
const BADGE_SHADOW_RADIUS = BADGE_RADIUS + 1;

export class AttackIndicator extends Phaser.GameObjects.Container {
  #turnsCountLabel: Phaser.GameObjects.Text;
  #turnsCount: number = 0;

  constructor(scene: Phaser.Scene, position: Point) {
    super(scene, position.x, position.y);
    const attackIcon = this.addIcon(scene);
    const { badge: turnsCountBadge, label } = this.buildBadge(scene);
    this.#turnsCountLabel = label;
    this.add([attackIcon, turnsCountBadge]);
  }

  // --------------- Public API ---------------

  setTurnsCount(amount: number) {
    this.#turnsCount = amount;
    this.#turnsCountLabel.text = `${this.#turnsCount}X`;
  }

  decreaseTurnsCountOn(amount: number) {
    this.setTurnsCount(this.#turnsCount - amount);
  }

  increaseTurnsCountOn(amount: number) {
    this.setTurnsCount(this.#turnsCount + amount);
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

  private buildBadge(scene: Phaser.Scene) {
    const { x, y } = BADGE_OFFSET;
    const badge = scene.add.container(x, y);

    // Shadow
    const { x: sX, y: sY } = BADGE_SHADOW_OFFSET;
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillCircle(sX, sY, BADGE_SHADOW_RADIUS);

    // Circle
    const circle = scene.add.graphics();
    circle.fillStyle(BADGE_COLOR, 1);
    circle.fillCircle(0, 0, BADGE_RADIUS);

    // Count label
    const label = scene.add
      .text(0, 0, "2X", {
        color: BADGE_TEXT_COLOR,
        fontFamily: "Chewy",
        fontSize: "20px",
      })
      .setOrigin(0.5);

    badge.add([shadow, circle, label]);
    return { badge, label };
  }
}
