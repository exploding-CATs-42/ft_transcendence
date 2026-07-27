import type { Point, Size } from "game/@types";
import { Textures } from "game/constants";

const FRAME_SIZE: Size = {
  width: 512,
  height: 288,
};

export class FireFrameAnimation extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, position: Point) {
    const { x, y } = position;
    super(scene, x, y, Textures.fire);
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
    this.play("fire");
  }

  private registerAnimationInsideScene(scene: Phaser.Scene): void {
    if (scene.anims.exists("fire")) {
      return;
    }

    scene.anims.create({
      key: "fire",
      frames: scene.anims.generateFrameNumbers(Textures.fire),
      frameRate: 10,
      repeat: 0,
    });
  }
}
