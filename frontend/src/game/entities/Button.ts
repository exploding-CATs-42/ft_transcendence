import type { LabelConfig, Point, Size } from "game/@types";

interface TextConfig extends LabelConfig {
  fontSize: number;
  fontFamily: string;
}

const TEXT_CONFIG: TextConfig = {
  fontColor: "black",
  strokeColor: "white",
  fontSize: 42,
  fontFamily: "Chewy",
};

const BORDER_RADIUS = 16;

type onClickHandler = (button: Button) => void;

export class Button {
  #scene: Phaser.Scene;
  #container: Phaser.GameObjects.Container;
  #text: Phaser.GameObjects.Text;
  #size: Size;

  constructor(
    scene: Phaser.Scene,
    position: Point,
    size: Size,
    text: string = "",
    onClick: onClickHandler,
  ) {
    this.#scene = scene;
    this.#container = scene.add.container(position.x, position.y);
    this.#size = size;

    const background = this.buildBackground();
    const textObject = this.buildText(text);

    this.#text = textObject;
    this.#container.add([background, textObject]);

    this.attachEventHandlers(onClick);
  }

  // --------------- Public API ---------------

  setText(text: string) {
    this.#text.setText(text);
  }

  // --------------- Event handlers ---------------

  private attachEventHandlers(onClick: onClickHandler) {
    this.#container.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, this.#size.width, this.#size.height),
      Phaser.Geom.Rectangle.Contains,
    );
    this.#container.input!.cursor = "pointer";

    this.#container.on("pointerdown", () => onClick(this));
  }

  // --------------- Builders ---------------

  private buildText(text: string) {
    const { width, height } = this.#size;

    const textObject = this.#scene.add
      .text(0, 0, text, {
        color: TEXT_CONFIG.fontColor,
        fontFamily: TEXT_CONFIG.fontFamily,
        fontSize: TEXT_CONFIG.fontSize,
      })
      .setPosition(width / 2, height / 2)
      .setOrigin(0.5, 0.5);

    return textObject;
  }

  private buildBackground() {
    const { width, height } = this.#size;

    const background = this.#scene.add.graphics();
    background.fillStyle(0x61c51b);
    background.fillRoundedRect(0, 0, width, height, BORDER_RADIUS);

    return background;
  }
}
