import { Textures } from "game/constants";

const PANEL_WIDTH = 1120;
const PANEL_HEIGHT = 500;
const CARD_WIDTH = 150;
const CARD_HEIGHT = 210;
const MAX_ROW_WIDTH = 1000;

export class ChooseRandomCardView extends Phaser.GameObjects.Container {
  onSelection?: (cardIndex: number) => void;

  #cards: Phaser.GameObjects.Image[] = [];
  #status: Phaser.GameObjects.Text;
  #selectionPending = false;

  constructor(scene: Phaser.Scene, cardsAmount: number) {
    super(scene);

    const background = scene.add
      .rectangle(0, 0, PANEL_WIDTH, PANEL_HEIGHT, 0xf3ead9, 0.98)
      .setStrokeStyle(3, 0xffffff, 0.7);
    const title = scene.add
      .text(0, -194, "Choose a random card", {
        fontFamily: "Chewy",
        fontSize: 42,
        color: "#2c211d",
      })
      .setOrigin(0.5);
    const hint = scene.add
      .text(0, -150, "All cards are hidden", {
        fontFamily: "Chewy",
        fontSize: 24,
        color: "#68564e",
      })
      .setOrigin(0.5);

    this.#cards = this.addCards(scene, cardsAmount);
    this.#status = scene.add
      .text(0, 205, "Click one card to steal it", {
        fontFamily: "Chewy",
        fontSize: 25,
        color: "#68564e",
      })
      .setOrigin(0.5);

    this.add([background, title, hint, ...this.#cards, this.#status]);
  }

  private addCards(scene: Phaser.Scene, cardsAmount: number) {
    const spacing =
      cardsAmount <= 1
        ? 0
        : Math.min(
            CARD_WIDTH * 0.55,
            (MAX_ROW_WIDTH - CARD_WIDTH) / (cardsAmount - 1),
          );
    const startX = -((cardsAmount - 1) * spacing) / 2;

    return Array.from({ length: cardsAmount }, (_, index) => {
      const card = scene.add
        .image(startX + index * spacing, 35, Textures.cardCover)
        .setDisplaySize(CARD_WIDTH, CARD_HEIGHT)
        .setDepth(index)
        .setInteractive({ useHandCursor: true });

      card.on("pointerover", () => {
        if (!this.#selectionPending) card.setY(20);
      });
      card.on("pointerout", () => {
        if (!this.#selectionPending) card.setY(35);
      });
      card.on("pointerdown", () => this.selectCard(index));

      return card;
    });
  }

  private selectCard(cardIndex: number) {
    if (this.#selectionPending) return;
    this.#selectionPending = true;
    this.#status.setText("Stealing selected card...").setColor("#2c211d");

    this.#cards.forEach((card, index) => {
      card.disableInteractive();
      card.setAlpha(index === cardIndex ? 1 : 0.25);
    });
    this.onSelection?.(cardIndex);
  }
}
