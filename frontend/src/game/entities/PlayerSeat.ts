import type { Point } from "game/@types";
import type { GraphicPlayer, OpponentHand } from "game/entities";

export class PlayerSeat {
  #container: Phaser.GameObjects.Container;
  player: GraphicPlayer | null;

  constructor(scene: Phaser.Scene, position: Point) {
    this.#container = scene.add.container(position.x, position.y);
    this.player = null;
  }

  addPlayer(player: GraphicPlayer) {
    this.#container.add(player.container);
    this.player = player;
  }

  addHand(hand: OpponentHand) {
    this.#container.add(hand.container);
  }

  moveTo(position: Point) {
    this.#container.setPosition(position.x, position.y);
  }
}
