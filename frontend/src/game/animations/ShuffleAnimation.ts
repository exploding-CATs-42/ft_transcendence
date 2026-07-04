import type { Point, Size } from "game/@types";
import { Textures } from "game/constants";

const FRAME_SIZE: Size = {
  width: 900,
  height: 1100,
};

export class ShuffleAnimation extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, position: Point) {
    const { x, y } = position;
    super(scene, x, y, Textures.shuffle);
    scene.add.existing(this);

    const { width, height } = FRAME_SIZE;
    this.setDisplaySize(width, height);
    this.setVisible(false);

    this.registerAnimationInsideScene(scene);
    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () =>
      this.setVisible(false),
    );
  }

  playAnimation() {
    this.setVisible(true);
    this.play("shuffle");
  }

  private registerAnimationInsideScene(scene: Phaser.Scene): void {
    scene.anims.create({
      key: "shuffle",
      frames: scene.anims.generateFrameNumbers(Textures.shuffle),
      frameRate: 30,
      repeat: 3,
    });
  }
}
