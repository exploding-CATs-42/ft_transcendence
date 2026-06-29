import type { Card } from "@exploding-cats/game-core";

export interface GraphicCard {
  image: Phaser.GameObjects.Image;
  data: Card;
}
