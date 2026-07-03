import { type Card, CardType } from "@exploding-cats/game-core";
import type { CardConfig, Point } from "game/@types";
import { CARD_TYPE_TO_FRAME, Textures } from "game/constants";
import { addCardVisual, getCardFrame } from "game/utils";

// -------------- CARD CONFIGURATION --------------
const CARD_WIDTH = 186 * 1.5;
const CARD_HEIGHT = 260 * 1.5;
const CARD_BORDER_RADIUS = 20;

// ------------------ SPACING ------------------
const SPACING_BETWEEN_CARDS = 400;

export class SeeTheFutureView extends Phaser.GameObjects.Container {
  onConfirm?: () => void;

  constructor(scene: Phaser.Scene, cards: Card[]) {
    super(scene);
    this.addCards(scene, cards);
    this.addConfirmationButton(scene);
  }

  // ------------------ INITIALIZATION ------------------

  private addCards(scene: Phaser.Scene, cards: Card[]) {
    const pos: Point = { x: 0, y: 0 };
    cards.forEach((card) => {
      const cardObject = this.addCard(scene, pos, card.type);
      this.add(cardObject);
      pos.x += SPACING_BETWEEN_CARDS;
    });
  }

  private addConfirmationButton(scene: Phaser.Scene) {
    const confirmationButton = scene.add
      .image(540, 500, Textures.confirmedIcon)
      .setDisplaySize(100, 100)
      .setInteractive({ useHandCursor: true });

    confirmationButton.on("pointerdown", () => {
      if (this.onConfirm) this.onConfirm();
    });

    this.add(confirmationButton);
  }

  // ------------------ UTILS ------------------

  private addCard(scene: Phaser.Scene, position: Point, type: CardType) {
    const card = this.addImage(scene, position, type);
    return card;
  }

  private addImage(scene: Phaser.Scene, position: Point, type: CardType) {
    const frameIndex = CARD_TYPE_TO_FRAME[type];
    const frame = getCardFrame(scene, frameIndex);
    const cardConfig = this.buildCardConfig(frame);
    const card = addCardVisual(scene, position, cardConfig, CARD_BORDER_RADIUS);
    return card;
  }

  private addLabel(scene: Phaser.Scene, position: Point, index: number) {
    const { x, y } = position;
    const text = index === 0 ? "Top" : `  ${index + 1}`;
    const label = scene.add.text(x, y, text, {
      fontFamily: "Chewy",
      fontSize: 44,
      stroke: "black",
      strokeThickness: 1,
    });
    return label;
  }

  private buildCardConfig(frame: Phaser.Textures.Frame): CardConfig {
    return {
      frame: frame,
      size: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      },
    };
  }
}
