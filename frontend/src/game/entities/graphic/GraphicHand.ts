import type { CardConfig, Point, SpacingConfig } from "game/@types";
import { SCREEN_HEIGHT } from "game/constants";
import { addCardVisual, getCardSpacing, getHandStartX } from "game/utils";
import { type Card } from "@exploding-cats/game-core";
import type { GraphicCard } from "./GraphicCard";
import { playCard } from "game/sockets";

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

type onCardDropCallback = (card: GraphicCard) => void;

export class GraphicHand {
  #scene: Phaser.Scene;
  #position: Point;
  #cardsData: Map<number, GraphicCard> = new Map();
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
  }

  // -------------- Public API --------------

  addCard(card: Card, frame: Phaser.Textures.Frame, insertIndex = -1) {
    if (insertIndex === -1)
      insertIndex = Phaser.Math.Between(0, this.#cards.length);

    this.adjustDepthsForInsertion(insertIndex);

    const x = this.getInsertPositionX(insertIndex);
    const y = SCREEN_HEIGHT;
    const newGraphicCard = this.addGraphicCard(x, y, frame, card);
    newGraphicCard.image.setDepth(insertIndex + 1);

    this.#scene.tweens.add({
      targets: newGraphicCard.image,
      x: x,
      y: this.#position.y,
      duration: 500,
      ease: "Back.easeOut",

      onComplete: () => {
        this.#cards.splice(insertIndex, 0, newGraphicCard.image);
        this.#cardsData.set(card.id, newGraphicCard);
        if (this.#cards.length > 1) this.reflowCards();
      },
    });
  }

  getCount() {
    return this.#cards.length;
  }

  // -------------- Card --------------

  private addGraphicCard(
    x: number,
    y: number,
    frame: Phaser.Textures.Frame,
    data: Card,
  ): GraphicCard {
    const cardConfig = this.buildCardConfig(frame);
    const image = addCardVisual(
      this.#scene,
      { x, y },
      cardConfig,
      CARD_BORDER_RADIUS,
    ).setInteractive({
      draggable: true,
      useHandCursor: true,
    });

    const newGraphicCard = {
      image,
      data,
    };

    this.attachCardDragHandlers(newGraphicCard.image);
    this.attachCardDropHandler(newGraphicCard);
    this.attachCardHoverHandler(newGraphicCard.image);

    return newGraphicCard;
  }

  // -------------- Event handlers --------------

  private attachCardDragHandlers(cardImage: Phaser.GameObjects.Image) {
    let originX: number;
    let originDepth: number;

    const onDragStart = () => {
      originX = cardImage.x;
      originDepth = cardImage.depth;
      cardImage.setDepth(BIGGEST_DEPTH);
    };

    const onDrag = (
      _pointer: Phaser.Input.Pointer,
      dragX: number,
      dragY: number,
    ) => {
      cardImage.x = dragX;
      cardImage.y = dragY;
    };

    const onDragEnd = () => {
      cardImage.setDepth(originDepth);

      this.#scene.tweens.add({
        targets: cardImage,
        x: originX,
        y: this.#position.y,
        duration: 300,
        ease: "Back.Out",
      });
    };

    cardImage.on("dragstart", onDragStart);
    cardImage.on("drag", onDrag);
    cardImage.on("dragend", onDragEnd);
  }

  removeCard(cardId: number) {
    const card = this.#cardsData.get(cardId)!;
    const cardImage = card.image;

    this.#cards = this.#cards.filter((c) => c !== cardImage);
    cardImage.off("drop", () => {
      playCard(cardData.id);
    });

    cardImage.disableInteractive();
    cardImage.setDepth(0);
    this.reflowCards();

    const cardData = card.data;
    this.#cardsData.delete(cardId);

    const graphicCard: GraphicCard = {
      image: cardImage,
      data: cardData,
    };
    this.#onCardDropCallback(graphicCard);
  }

  private attachCardDropHandler(graphicCard: GraphicCard) {
    const cardData = graphicCard.data;
    const cardImage = graphicCard.image;

    cardImage.on("drop", () => {
      playCard(cardData.id);
    });
  }

  private attachCardHoverHandler(cardImage: Phaser.GameObjects.Image) {
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
      tween(cardImage, { y: targetY });
    };

    const lowerCard = () => {
      const baseY = this.#position.y;
      tween(cardImage, { y: baseY });
    };

    cardImage.on("pointerover", () => {
      const hoveredIndex = this.#cards.indexOf(cardImage);
      liftCard();
      applyHoverLayout(hoveredIndex);
    });

    cardImage.on("pointerout", () => {
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

  private getInsertPositionX(insertIndex: number) {
    const { spacing, startX } = this.getLayout();

    let targetX;
    if (this.#cards.length === 0) targetX = this.#position.x - CARD_WIDTH / 2;
    else targetX = startX + spacing * insertIndex - spacing / 2;

    return targetX;
  }
}
