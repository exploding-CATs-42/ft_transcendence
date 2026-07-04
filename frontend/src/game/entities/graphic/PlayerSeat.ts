import type { Point, Size } from "game/@types";
import { Textures } from "game/constants";
import {
  type GraphicPlayer,
  type OpponentHand,
  AttackIndicator,
} from "game/entities/graphic";

const TARGET_ICON_OFFSET: Point = {
  x: 30,
  y: 156,
};

const ATTACK_INDICATOR_OFFSET: Point = TARGET_ICON_OFFSET;

const HIT_BOX_SIZE: Size = {
  width: 240,
  height: 300,
};

export class PlayerSeat {
  #container: Phaser.GameObjects.Container;
  player: GraphicPlayer | null;
  hand: OpponentHand | null;
  targetIcon: Phaser.GameObjects.Image;
  attackIndicator: AttackIndicator;
  onClick?: ((playerId: string) => void) | null;

  constructor(scene: Phaser.Scene, position: Point) {
    this.#container = this.initializeContainer(scene, position);
    this.player = null;
    this.hand = null;
    this.targetIcon = this.addTargetIcon(scene);
    this.attackIndicator = this.addAttackIndicator(scene);
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

  setCursorPointer(value: boolean) {
    if (value === true) this.#container.input!.cursor = "pointer";
    else this.#container.input!.cursor = "default";
  }

  private initializeContainer(scene: Phaser.Scene, position: Point) {
    const container = scene.add.container(position.x, position.y);
    this.addHitBox(container);

    return container;
  }

  private addHitBox(container: Phaser.GameObjects.Container) {
    const { width, height } = HIT_BOX_SIZE;
    container.setSize(width, height);
    container.setInteractive(
      new Phaser.Geom.Rectangle(width / 2 - 30, height / 2 - 30, width, height),
      Phaser.Geom.Rectangle.Contains,
    );

    container.on("pointerdown", () => {
      if (this.onClick) this.onClick(this.player!.id);
    });
  }

  private addTargetIcon(scene: Phaser.Scene) {
    const { x, y } = TARGET_ICON_OFFSET;
    const image = scene.add.image(x, y, Textures.targetIcon);
    image.setVisible(false);
    this.#container.add(image);

    return image;
  }

  private addAttackIndicator(scene: Phaser.Scene) {
    const attackIndicator = new AttackIndicator(scene, ATTACK_INDICATOR_OFFSET);
    attackIndicator.setVisible(false);
    this.#container.add(attackIndicator);

    return attackIndicator;
  }
}
