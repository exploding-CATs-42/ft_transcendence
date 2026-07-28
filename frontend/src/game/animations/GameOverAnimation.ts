import type { Point, Size } from "game/@types";
import { Textures } from "game/constants";

const FRAME_RATE = 12;

export class GameOverAnimation extends Phaser.GameObjects.Sprite {
  // `areaToCover` is filled the way a CSS `background-size: cover` would:
  // the 4:3 frames keep their ratio and overflow instead of stretching.
  constructor(scene: Phaser.Scene, position: Point, areaToCover?: Size) {
    const { x, y } = position;
    super(scene, x, y, Textures.nuclear);
    scene.add.existing(this);

    if (areaToCover) {
      this.coverArea(areaToCover);
    }

    this.registerAnimationInsideScene(scene);
  }

  playAnimation() {
    this.play("nuclear");
  }

  private coverArea({ width, height }: Size) {
    this.setScale(Math.max(width / this.width, height / this.height));
  }

  private registerAnimationInsideScene(scene: Phaser.Scene): void {
    if (scene.anims.exists("nuclear")) {
      return;
    }

    scene.anims.create({
      key: "nuclear",
      frames: scene.anims.generateFrameNumbers(Textures.nuclear),
      frameRate: FRAME_RATE,
      repeat: -1,
    });
  }
}
