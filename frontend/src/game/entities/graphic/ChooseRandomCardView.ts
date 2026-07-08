const CARD_WIDTH = 186;
const CARD_HEIGHT = 260;
const CARD_BORDER_RADIUS = 20;

const CARD_DROP_ZONE = {
  x: 0,
  y: 400,
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
};

export class ChooseRandomCardView extends Phaser.GameObjects.Container {
  onSelection?: (cardIndex: number) => void;
  #hand: Pile;

  constructor(scene: Phaser.Scene, cardsAmount: number) {
    super(scene);

    const { zone, outline } = this.createCardDropZone(scene);
    this.#hand = new Pile(scene, { x: 0, y: 0 }, cardsAmount);
    this.#hand.onCardDrop = (
      card: Phaser.GameObjects.Image,
      cardIndex: number,
    ) => {
      this.bringToTop(outline);
      scene.add.tween({
        targets: card,
        x: CARD_DROP_ZONE.x,
        y: CARD_DROP_ZONE.y,
        duration: 300,
        ease: "Back.Out",
        onComplete: () => {
          if (this.onSelection) this.onSelection(cardIndex);
        },
      });
    };

    this.add([zone, outline, this.#hand]);
  }

  private createCardDropZone(scene: Phaser.Scene) {
    const { x, y, width, height } = CARD_DROP_ZONE;
    const zone = scene.add.zone(x, y, width, height).setOrigin(0, 0);
    zone.setRectangleDropZone(width, height);

    // Zone visualization
    const outline = scene.add.graphics();
    outline.lineStyle(4, 0xffffff, 1);
    outline.strokeRoundedRect(x, y, width, height, CARD_BORDER_RADIUS);

    return { zone, outline };
  }
}

// New class alert

import type { CardConfig, Point, SpacingConfig } from "game/@types";
import { Textures } from "game/constants";
import { addCardVisual, getCardSpacing, getHandStartX } from "game/utils";

const CARD_SPACING_CONFIG: SpacingConfig = {
  minSpacing: CARD_WIDTH / 3,
  maxSpacing: CARD_WIDTH / 2,
  cardsBeforeMinSpacing: 20,
};

const HOVER_LIFT = -40; // How many px the hovered card rises

class Pile extends Phaser.GameObjects.Container {
  onCardDrop?: (card: Phaser.GameObjects.Image, cardIndex: number) => void;
  #scene: Phaser.Scene;
  #cards: Phaser.GameObjects.Image[] = [];

  constructor(scene: Phaser.Scene, position: Point, cardsAmount: number) {
    super(scene);
    this.#scene = scene;
    this.setPosition(position.x, position.y);

    for (let i = 0; i < cardsAmount; ++i) {
      this.addCard();
    }
    this.reflowCards();
  }

  private addCard() {
    const card = this.buildCard();
    this.#cards.push(card);
    this.add(card);
  }

  // --------------- Layout ---------------

  private reflowCards() {
    const count = this.#cards.length;
    if (count === 0) return;

    const spacing = getCardSpacing(count, CARD_SPACING_CONFIG);
    let x = getHandStartX(count, spacing, CARD_WIDTH, 0);
    // Somehow this line of code puts pile right in the middle of the screen
    x += CARD_WIDTH / 2;

    this.#cards.forEach((card, i) => {
      card.setDepth(i);

      this.#scene.tweens.add({
        targets: card,
        x: x,
        y: this.y,
        duration: 250,
        ease: "Back.Out",
      });

      x += spacing;
    });
  }

  // --------------- Builders ---------------

  private buildCard() {
    const card = addCardVisual(
      this.#scene,
      { x: 0, y: 0 },
      this.buildCardConfig(),
      CARD_BORDER_RADIUS,
    );

    card.setInteractive({ draggable: true, useHandCursor: true });
    this.attachCardDragHandlers(card);
    this.attachCardDropHandler(card);
    this.attachCardHoverHandler(card);

    return card;
  }

  private buildCardConfig(): CardConfig {
    const cardCover = this.#scene.textures.get(Textures.cardCover).get();
    return {
      frame: cardCover,
      size: { width: CARD_WIDTH, height: CARD_HEIGHT },
    };
  }

  // --------------- Event handlers ---------------

  private attachCardHoverHandler(card: Phaser.GameObjects.Image) {
    const tween = (target: Phaser.GameObjects.GameObject, props: object) => {
      this.#scene.tweens.add({
        targets: target,
        duration: 120,
        ease: "Power2",
        ...props,
      });
    };

    const liftCard = () => {
      const targetY = this.y - HOVER_LIFT;
      tween(card, { y: targetY });
    };

    const lowerCard = () => {
      const baseY = this.y;
      tween(card, { y: baseY });
    };

    card.on("pointerover", () => {
      liftCard();
    });

    card.on("pointerout", () => {
      lowerCard();
    });
  }

  private attachCardDragHandlers(card: Phaser.GameObjects.Image) {
    let originX: number;
    let originDepth: number;

    const onDragStart = () => {
      originX = card.x;
      originDepth = card.depth;
      this.bringToTop(card);
    };

    const onDrag = (
      _pointer: Phaser.Input.Pointer,
      dragX: number,
      dragY: number,
    ) => {
      card.x = dragX;
      card.y = dragY;
    };

    const onDragEnd = () => {
      this.moveTo(card, originDepth);

      this.#scene.tweens.add({
        targets: card,
        x: originX,
        y: this.y,
        duration: 300,
        ease: "Back.Out",
      });
    };

    card.on("dragstart", onDragStart);
    card.on("drag", onDrag);
    card.on("dragend", onDragEnd);
  }

  private attachCardDropHandler(card: Phaser.GameObjects.Image) {
    const onCardDrop = () => {
      this.#cards = this.#cards.filter((c) => c !== card);

      card.off("drop", onCardDrop);
      card.disableInteractive();
      this.reflowCards();

      if (this.onCardDrop) this.onCardDrop(card, card.depth);
    };

    card.on("drop", onCardDrop);
  }
}
