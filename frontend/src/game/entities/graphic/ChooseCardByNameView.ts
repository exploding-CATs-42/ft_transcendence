import type { CardType } from "@exploding-cats/game-core";
import { CARD_OPTIONS, CARD_TYPE_TO_FRAME, Textures } from "game/constants";
import { addCardVisual } from "game/utils";

const PANEL_WIDTH = 1120;
const PANEL_HEIGHT = 680;
const CARD_WIDTH = 142;
const CARD_HEIGHT = 198;
const CARD_BORDER_RADIUS = 10;
const COLUMNS = 6;
const COLUMN_GAP = 170;
const ROW_GAP = 235;

export class ChooseCardByNameView extends Phaser.GameObjects.Container {
  onSelection?: (type: CardType) => void;

  #cards: Array<{ type: CardType; image: Phaser.GameObjects.Image }> = [];
  #status: Phaser.GameObjects.Text;
  #selectionPending = false;

  constructor(scene: Phaser.Scene, targetName: string) {
    super(scene);

    const background = scene.add.graphics();
    background.fillStyle(0xf3ead9, 0.98);
    background.lineStyle(3, 0xffffff, 0.7);
    background.fillRoundedRect(
      -PANEL_WIDTH / 2,
      -PANEL_HEIGHT / 2,
      PANEL_WIDTH,
      PANEL_HEIGHT,
      20,
    );
    background.strokeRoundedRect(
      -PANEL_WIDTH / 2,
      -PANEL_HEIGHT / 2,
      PANEL_WIDTH,
      PANEL_HEIGHT,
      20,
    );

    const title = scene.add
      .text(0, -294, `Choose a card from ${targetName}`, {
        fontFamily: "Chewy",
        fontSize: 42,
        color: "#2c211d",
      })
      .setOrigin(0.5);
    const hint = scene.add
      .text(0, -248, "You get it only if that player has one", {
        fontFamily: "Chewy",
        fontSize: 24,
        color: "#68564e",
      })
      .setOrigin(0.5);

    this.#cards = CARD_OPTIONS.map(({ type }, index) => ({
      type,
      image: this.addCard(scene, type, index),
    }));

    this.#status = scene.add
      .text(0, 300, "Select the card you want to request", {
        fontFamily: "Chewy",
        fontSize: 25,
        color: "#68564e",
      })
      .setOrigin(0.5);

    this.add([
      background,
      title,
      hint,
      ...this.#cards.map(({ image }) => image),
      this.#status,
    ]);
  }

  private addCard(scene: Phaser.Scene, type: CardType, index: number) {
    const column = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);

    const frame = scene.textures
      .get(Textures.cards)
      .get(CARD_TYPE_TO_FRAME[type]);
    const image = addCardVisual(
      scene,
      { x: (column - (COLUMNS - 1) / 2) * COLUMN_GAP, y: -105 + row * ROW_GAP },
      { frame, size: { width: CARD_WIDTH, height: CARD_HEIGHT } },
      CARD_BORDER_RADIUS,
    )
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true });

    image.on("pointerover", () => {
      if (!this.#selectionPending) {
        scene.tweens.add({
          targets: image,
          alpha: 0.82,
          duration: 140,
          ease: "Sine.Out",
        });
      }
    });
    image.on("pointerout", () => {
      if (!this.#selectionPending) {
        scene.tweens.add({
          targets: image,
          alpha: 1,
          duration: 140,
          ease: "Sine.Out",
        });
      }
    });
    image.on("pointerdown", () => this.selectCard(type));

    return image;
  }

  private selectCard(type: CardType) {
    if (this.#selectionPending) return;
    this.#selectionPending = true;

    const label = CARD_OPTIONS.find((option) => option.type === type)?.label;
    this.#status
      .setText(`Requesting ${label ?? type.replaceAll("_", " ")}...`)
      .setColor("#2c211d");

    this.#cards.forEach((card) => {
      card.image.disableInteractive();
      card.image.setAlpha(card.type === type ? 1 : 0.25);
    });
    this.onSelection?.(type);
  }
}
