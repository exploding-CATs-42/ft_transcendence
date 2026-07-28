import type { Point, Size } from "game/@types";
import { Textures } from "game/constants";

const FRAME_SIZE: Size = {
  width: 194,
  height: 194,
};

export class NopeAnimation extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, position: Point) {
    const { x, y } = position;
    super(scene, x, y, Textures.nope);
    scene.add.existing(this);

    const { width, height } = FRAME_SIZE;
    this.setDisplaySize(width, height);
    this.setVisible(false);

    this.registerAnimationInsideScene(scene);
    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () =>
      this.setVisible(false),
    );
  }

  playAnimation(durationMs: number) {
    this.setVisible(true);

    // play() ignores `duration` when a frameRate is set on the animation, so the duration has to be expressed as a frame rate instead.
    const totalFrames = this.scene.anims.get("nope").getTotalFrames();

    this.play({ key: "nope", frameRate: totalFrames / (durationMs / 1000) });
  }

  private registerAnimationInsideScene(scene: Phaser.Scene): void {
    scene.anims.create({
      key: "nope",
      frames: scene.anims.generateFrameNumbers(Textures.nope),
      repeat: 0,
    });
  }
}
