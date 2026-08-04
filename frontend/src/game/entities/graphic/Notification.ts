import type { Point } from "game/@types";

const BACKGROUND_CONFIG = {
  width: 440,
  height: 140,
  color: 0x000000,
  borderRadius: 20,
};

const TEXT_CONFIG = {
  color: "#FFF9E6",
  fontFamily: "Chewy",
  fontSize: 33,

  stroke: "#5A3512", // dark brown outline
  strokeThickness: 6,

  dropShadow: true,
  dropShadowColor: "#000000",
  dropShadowBlur: 2,
  dropShadowAngle: Math.PI / 4,
  dropShadowDistance: 4,
};

export const NotificationMode = {
  SEE_THE_FUTURE: "SEE_THE_FUTURE",
  WAITING_FOR_PLAYER_SELECTION: "WAITING_FOR_PLAYER_SELECTION",
  SELECT_PLAYER: "SELECT_PLAYER",
  SELECT_CARD: "SELECT_CARD",
  EXPLODING_KITTEN: "EXPLODING_KITTEN",
  WAITING_FOR_CARD_SELECTION: "WAITING_FOR_CARD_SELECTION",
  WAITING_FOR_NOPES: "WAITING_FOR_NOPES",
  INSERTING_KITTEN: "INSERTING_KITTEN",
  TURN_CHANGED: "TURN_CHANGED",
} as const;

export type NotificationMode =
  (typeof NotificationMode)[keyof typeof NotificationMode];

export class Notification extends Phaser.GameObjects.Container {
  #label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, position: Point) {
    super(scene);

    const background = this.addBackground(scene);
    const label = this.addLabel(scene);
    this.#label = label;
    this.add([background, label]);

    const { x, y } = position;
    this.setPosition(x, y);

    scene.add.existing(this);
  }

  private addBackground(scene: Phaser.Scene) {
    const { width, height, color, borderRadius } = BACKGROUND_CONFIG;

    const graphics = scene.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(
      -width / 2,
      -height / 2,
      width,
      height,
      borderRadius,
    );

    return graphics;
  }

  private addLabel(scene: Phaser.Scene) {
    const label = scene.add
      .text(0, 0, "", { ...TEXT_CONFIG })
      .setOrigin(0.5, 0.5);

    return label;
  }

  showMessageFor(mode: NotificationMode) {
    this.setVisible(true);

    let text = "";
    if (mode === NotificationMode.SEE_THE_FUTURE) {
      text = "Player is looking at the cards";
    } else if (mode === NotificationMode.WAITING_FOR_PLAYER_SELECTION) {
      text = "Player is selecting a target";
    } else if (mode === NotificationMode.SELECT_PLAYER) {
      text = "Select a player";
    } else if (mode === NotificationMode.SELECT_CARD) {
      text = "Select a card";
    } else if (mode === NotificationMode.EXPLODING_KITTEN) {
      text = " Player drew an\nexploding kitten";
    } else if (mode === NotificationMode.WAITING_FOR_CARD_SELECTION) {
      text = "Player is selecting a card";
    } else if (mode === NotificationMode.WAITING_FOR_NOPES) {
      text = "Waiting for nope cards";
    } else if (mode === NotificationMode.INSERTING_KITTEN) {
      text = "Player is placing kitten\n    back into the deck";
    } else if (mode === NotificationMode.TURN_CHANGED) {
      text = "Players\`s turn";
    }
    this.#label.setText(text);
  }
}
