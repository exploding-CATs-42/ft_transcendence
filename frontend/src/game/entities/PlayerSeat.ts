import type { Point } from "game/@types";
import type { GraphicPlayer, OpponentHand } from "game/entities";

export class PlayerSeat {
  #container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, position: Point) {
    this.#container = scene.add.container(position.x, position.y);
  }

  addPlayer(player: GraphicPlayer) {
    this.#container.add(player.container);
  }

  addHand(hand: OpponentHand) {
    this.#container.add(hand.container);
  }

  moveTo(position: Point) {
    this.#container.setPosition(position.x, position.y);
  }
}
