import type { Point } from "game/@types";
import type { GraphicPlayer, OpponentHand } from "game/entities/graphic";

export class PlayerSeat {
  #container: Phaser.GameObjects.Container;
  player: GraphicPlayer | null;
  hand: OpponentHand | null;
  targetIcon: Phaser.GameObjects.Image | null;

  constructor(scene: Phaser.Scene, position: Point) {
    this.#container = scene.add.container(position.x, position.y);
    this.player = null;
    this.hand = null;
    this.targetIcon = null;
  }

  addPlayer(player: GraphicPlayer) {
    if (this.player) return;

    this.#container.add(player.container);
    this.player = player;
  }

  removePlayer() {
    if (!this.player) return;

    this.#container.remove(this.player.container, true);
    this.player = null;
  }

  addHand(hand: OpponentHand) {
    if (this.hand) return;

    this.#container.add(hand.container);
    this.hand = hand;
  }

  moveTo(position: Point) {
    this.#container.setPosition(position.x, position.y);
  }
}
