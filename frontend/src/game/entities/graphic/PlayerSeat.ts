import type { Point } from "game/@types";
import { Textures } from "game/constants";
import type { GraphicPlayer, OpponentHand } from "game/entities/graphic";

const TARGET_ICON_OFFSET: Point = {
  x: 30,
  y: 156,
};

export class PlayerSeat {
  #container: Phaser.GameObjects.Container;
  player: GraphicPlayer | null;
  hand: OpponentHand | null;
  targetIcon: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, position: Point) {
    this.#container = scene.add.container(position.x, position.y);
    this.player = null;
    this.hand = null;
    this.targetIcon = this.createTargetIcon(scene);
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

  setTargetIconVisible(value: boolean) {
    this.targetIcon.setVisible(value);
    if (value === true) this.#container.bringToTop(this.targetIcon);
  }

  private createTargetIcon(scene: Phaser.Scene) {
    const { x, y } = TARGET_ICON_OFFSET;
    const image = scene.add.image(x, y, Textures.targetIcon);
    image.setVisible(false);
    this.#container.add(image);

    return image;
  }
}
