import type { Point } from "game/@types";

export class AttackIndicator extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, position: Point) {
    super(scene, position.x, position.y);
  }
}
