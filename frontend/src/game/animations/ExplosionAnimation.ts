import type { Point, Size } from "game/@types";
import { Textures } from "game/constants";

const FRAME_SIZE: Size = {
  width: 550,
  height: 550,
};

export class ExplosionAnimation extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, position: Point) {
    const { x, y } = position;
    super(scene, x, y, Textures.boomExplosion);
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
    this.play("explosion");
  }

  private registerAnimationInsideScene(scene: Phaser.Scene): void {
    scene.anims.create({
      key: "explosion",
      frames: scene.anims.generateFrameNumbers(Textures.boomExplosion),
      frameRate: 8,
      repeat: 0,
    });
  }
}
