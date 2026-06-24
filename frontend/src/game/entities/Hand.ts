import type { CardConfig, Point, SpacingConfig } from "game/@types";
import { SCREEN_HEIGHT, Textures } from "game/constants";
import { addCardVisual, getCardSpacing, getHandStartX } from "game/utils";

const CARD_WIDTH = 186 * 1.75;
const CARD_HEIGHT = 260 * 1.75;
const CARD_BORDER_RADIUS = 20;

const CARD_SPACING_CONFIG: SpacingConfig = {
  minSpacing: 60,
  maxSpacing: 120,
  cardsBeforeMinSpacing: 20,
};

const BIGGEST_DEPTH = 100;

const HOVER_LIFT = 75; // How many px the hovered card rises
const HOVER_OFFSET = CARD_WIDTH / 4; // How many px surrounding cards move to the side

type onCardDropCallback = (card: Phaser.GameObjects.Image) => void;

export class Hand {
  #scene: Phaser.Scene;
  #position: Point;
  #cards: Phaser.GameObjects.Image[] = [];
  #onCardDropCallback: onCardDropCallback;

  constructor(
    scene: Phaser.Scene,
    position: Point,
    onCardDropCallback: onCardDropCallback,
  ) {
    this.#scene = scene;
    this.#position = position;
    this.#onCardDropCallback = onCardDropCallback;

    for (let i = 0; i < 8; ++i) {
      this.addCard();
    }
  }

  // -------------- Public API --------------

  addCard(insertIndex = -1) {
    if (insertIndex === -1)
      insertIndex = Phaser.Math.Between(0, this.#cards.length);

    this.adjustDepthsForInsertion(insertIndex);

    const frame = this.getRandomCardFrame();
    const x = this.getInsertPositionX(insertIndex);
    const y = SCREEN_HEIGHT;
    const newCard = this.addInteractiveCard(x, y, frame);
    newCard.setDepth(insertIndex + 1);

    this.#scene.tweens.add({
      targets: newCard,
      x: x,
      y: this.#position.y,
      duration: 500,
      ease: "Back.easeOut",

      onComplete: () => {
        this.#cards.splice(insertIndex, 0, newCard);
        if (this.#cards.length > 1) this.reflowCards();
      },
    });
  }

  getCount() {
    return this.#cards.length;
  }

  // -------------- Card --------------

  private addInteractiveCard(
    x: number,
    y: number,
    frame: Phaser.Textures.Frame,
  ): Phaser.GameObjects.Image {
    const cardConfig = this.buildCardConfig(frame);
    const card = addCardVisual(
      this.#scene,
      { x, y },
      cardConfig,
      CARD_BORDER_RADIUS,
    ).setInteractive({
      draggable: true,
      useHandCursor: true,
    });

    this.attachCardDragHandlers(card);
    this.attachCardDropHandler(card);
    this.attachCardHoverHandler(card);

    return card;
  }

  // -------------- Event handlers --------------

  private attachCardDragHandlers(card: Phaser.GameObjects.Image) {
    let originX: number;
    let originDepth: number;

    const onDragStart = () => {
      originX = card.x;
      originDepth = card.depth;
      card.setDepth(BIGGEST_DEPTH);
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
      card.setDepth(originDepth);

      this.#scene.tweens.add({
        targets: card,
        x: originX,
        y: this.#position.y,
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
      this.#onCardDropCallback(card);
      card.setDepth(0);

      this.reflowCards();
    };

    card.on("drop", onCardDrop);
  }

  private attachCardHoverHandler(card: Phaser.GameObjects.Image) {
    const tween = (target: Phaser.GameObjects.Image, props: object) => {
      this.#scene.tweens.add({
        targets: target,
        duration: 120,
        ease: "Power2",
        ...props,
      });
    };

    const applyHoverLayout = (hoveredIndex: number) => {
      const { spacing, startX } = this.getLayout();

      this.#cards.forEach((card, index) => {
        if (index === hoveredIndex) return;

        const offset = index < hoveredIndex ? -HOVER_OFFSET : HOVER_OFFSET;

        const baseX = startX + spacing * index;
        const targetX = baseX + offset;
        tween(card, { x: targetX });
      });
    };

    const resetLayout = () => {
      const { spacing, startX } = this.getLayout();

      this.#cards.forEach((c, index) => {
        const baseX = startX + spacing * index;
        tween(c, { x: baseX });
      });
    };

    const liftCard = () => {
      const targetY = this.#position.y - HOVER_LIFT;
      tween(card, { y: targetY });
    };

    const lowerCard = () => {
      const baseY = this.#position.y;
      tween(card, { y: baseY });
    };

    card.on("pointerover", () => {
      const hoveredIndex = this.#cards.indexOf(card);
      liftCard();
      applyHoverLayout(hoveredIndex);
    });

    card.on("pointerout", () => {
      lowerCard();
      resetLayout();
    });
  }

  // -------------- Layout --------------

  getLayout() {
    const cardCount = this.#cards.length;
    const spacing = getCardSpacing(cardCount, CARD_SPACING_CONFIG);
    const baseX = this.#position.x;
    const startX = getHandStartX(cardCount, spacing, CARD_WIDTH, baseX);

    return { spacing, startX };
  }

  private reflowCards() {
    const { spacing, startX } = this.getLayout();

    let x = startX;
    this.#cards.forEach((card, index) => {
      card.setDepth(index + 1);

      this.#scene.tweens.add({
        targets: card,
        x: x,
        y: this.#position.y,
        duration: 250,
        ease: "Back.Out",
      });

      x += spacing;
    });
  }

  private adjustDepthsForInsertion(insertIndex: number) {
    // Update the depth of the cards in player's hand,
    // so that new card doesn't overlay them
    this.#cards.forEach((card, index) => {
      if (index >= insertIndex) card.setDepth(index + 1 + 1);
      else card.setDepth(index + 1);
    });

    // I set card depth to one higher than it's index,
    // so that their depth will start from 1,
    // so that all cards will always be higher than other elements
    // because other elements get depth of 0 by default

    // and therefore when I update their depths in this function,
    // when inserting a new card,
    // I set depth of cards that are higher than inserted card
    // to their default depth, which is index + 1,
    // plus one, to actually put them above the newly inserted card
  }

  // -------------- Builders --------------

  private buildCardConfig(frame: Phaser.Textures.Frame): CardConfig {
    return {
      frame: frame,
      size: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      },
    };
  }

  // -------------- Utils --------------

  private getRandomCardFrame() {
    const cardSpreadsheet = this.#scene.textures.get(Textures.cards);
    const frameNumber = Phaser.Math.Between(4, 40);
    const frame = cardSpreadsheet.get(frameNumber);

    return frame;
  }

  private getInsertPositionX(insertIndex: number) {
    const { spacing, startX } = this.getLayout();

    let targetX;
    if (this.#cards.length === 0) targetX = this.#position.x - CARD_WIDTH / 2;
    else targetX = startX + spacing * insertIndex - spacing / 2;

    return targetX;
  }
}
