import { DEFAULT_GAME_RULES } from "@exploding-cats/game-core";
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

  playAnimation() {
    this.setVisible(true);
    this.play("nope");
  }

  private registerAnimationInsideScene(scene: Phaser.Scene): void {
    scene.anims.create({
      key: "nope",
      frames: scene.anims.generateFrameNumbers(Textures.nope),
      duration: DEFAULT_GAME_RULES.nopeWindowMs,
      repeat: 0,
    });
  }
}
