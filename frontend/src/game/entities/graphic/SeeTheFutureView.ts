import { type Card } from "@exploding-cats/game-core";

export class SeeTheFutureView extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, cards: Card[]) {
    super(scene);
  }
}
