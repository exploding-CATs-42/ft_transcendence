import type { Point } from "game/@types";

const BACKGROUND_CONFIG = {
  width: 440,
  height: 80,
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

const TEXT_PADDING = {
  left: 60,
  right: 60,
  top: 5,
  bottom: 5,
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
  #background: Phaser.GameObjects.Graphics;
  #hideTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: Phaser.Scene, position: Point) {
    super(scene);

    const label = this.addLabel(scene);
    const background = this.addBackground(scene);
    this.drawBackground(background, label.width, label.height);

    this.#label = label;
    this.#background = background;
    this.add([background, label]);

    const { x, y } = position;
    this.setPosition(x, y);
    this.setDepth(1000);

    scene.add.existing(this);
  }

  private drawBackground(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
  ) {
    const { color } = BACKGROUND_CONFIG;
    const { left, right, top, bottom } = TEXT_PADDING;

    graphics.clear();
    graphics.fillStyle(color, 0.5);

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const topInset = 40;

    graphics.beginPath();

    // Bottom edge (slightly narrower)
    graphics.moveTo(halfWidth + right - topInset, halfHeight + bottom);
    graphics.lineTo(-(halfWidth + left - topInset), halfHeight + bottom);

    // Top edge (full width)
    graphics.lineTo(-(halfWidth + left), -halfHeight - top);
    graphics.lineTo(halfWidth + right, -halfHeight - top);

    graphics.closePath();
    graphics.fillPath();
  }

  private addBackground(scene: Phaser.Scene) {
    const graphics = scene.add.graphics();

    return graphics;
  }

  private addLabel(scene: Phaser.Scene) {
    const label = scene.add
      .text(0, 0, "", { ...TEXT_CONFIG })
      .setOrigin(0.5, 0.5);

    return label;
  }

  showMessage(message: string) {
    this.#hideTimer?.remove(false);
    this.#hideTimer = null;
    this.setVisible(true);
    this.#label.setText(message);
    this.#background.clear();
    this.drawBackground(
      this.#background,
      this.#label.width,
      this.#label.height,
    );
  }

  showTransientMessage(message: string, duration = 3000) {
    this.showMessage(message);

    this.#hideTimer = this.scene.time.delayedCall(duration, () => {
      this.setVisible(false);
      this.#hideTimer = null;
    });
  }

  showMessageFor(mode: NotificationMode, playerName: string = "Player") {
    let text = "";
    if (mode === NotificationMode.SEE_THE_FUTURE) {
      text = `${playerName} is looking at the cards`;
    } else if (mode === NotificationMode.WAITING_FOR_PLAYER_SELECTION) {
      text = `${playerName} is selecting a target`;
    } else if (mode === NotificationMode.SELECT_PLAYER) {
      text = `Select a player`;
    } else if (mode === NotificationMode.SELECT_CARD) {
      text = `Select a card`;
    } else if (mode === NotificationMode.EXPLODING_KITTEN) {
      text = `${playerName} drew an exploding kitten`;
    } else if (mode === NotificationMode.WAITING_FOR_CARD_SELECTION) {
      text = `${playerName} is selecting a card`;
    } else if (mode === NotificationMode.WAITING_FOR_NOPES) {
      text = `Waiting for nope cards`;
    } else if (mode === NotificationMode.INSERTING_KITTEN) {
      text = `${playerName} is placing kitten back into the deck`;
    } else if (mode === NotificationMode.TURN_CHANGED) {
      text = `${playerName}\`s turn`;
    }
    this.showMessage(text);
  }
}
