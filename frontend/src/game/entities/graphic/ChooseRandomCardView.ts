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
      .text(0, -194, "Choose a random card", {
        fontFamily: "Chewy",
        fontSize: 42,
        color: "#2c211d",
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

    this.add([background, title, ...this.#cards, this.#status]);
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
        .image(startX + index * spacing, 20, Textures.cardCover)
        .setDisplaySize(CARD_WIDTH, CARD_HEIGHT)
        .setDepth(index)
        .setInteractive({ useHandCursor: true });

      card.on("pointerover", () => {
        if (!this.#selectionPending) {
          scene.tweens.add({
            targets: card,
            y: 35,
            duration: 250,
            ease: "Back.Out",
          });
        }
      });
      card.on("pointerout", () => {
        if (!this.#selectionPending) {
          scene.tweens.add({
            targets: card,
            y: 20,
            duration: 250,
            ease: "Back.Out",
          });
        }
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
