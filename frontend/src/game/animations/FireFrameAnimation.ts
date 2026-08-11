import type { Point, Size } from "game/@types";
import { Textures } from "game/constants";

const FRAME_SIZE: Size = {
  width: 512,
  height: 288,
};

export class FireFrameAnimation extends Phaser.GameObjects.Sprite {
  #isPlayable: boolean;

  constructor(scene: Phaser.Scene, position: Point) {
    const { x, y } = position;
    super(scene, x, y, Textures.fire);
    scene.add.existing(this);

    const { width, height } = FRAME_SIZE;
    this.setDisplaySize(width, height);
    this.setVisible(false);

    this.#isPlayable = this.registerAnimationInsideScene(scene);
    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () =>
      this.setVisible(false),
    );
  }

  playAnimation() {
    // The texture may have failed to load; a missing flame must not take down
    // the view that owns it.
    if (!this.#isPlayable) {
      return;
    }

    this.setVisible(true);
    this.play("fire");
  }

  private registerAnimationInsideScene(scene: Phaser.Scene): boolean {
    if (scene.anims.exists("fire")) {
      return true;
    }

    if (!scene.textures.exists(Textures.fire)) {
      return false;
    }

    scene.anims.create({
      key: "fire",
      frames: scene.anims.generateFrameNumbers(Textures.fire),
      frameRate: 10,
      repeat: 0,
    });

    return true;
  }
}
