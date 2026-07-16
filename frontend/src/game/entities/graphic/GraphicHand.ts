import type { CardConfig, Point, SpacingConfig } from "game/@types";
import { SCREEN_HEIGHT } from "game/constants";
import { addCardVisual, getCardSpacing, getHandStartX } from "game/utils";
import { type Card, type CardType } from "@exploding-cats/game-core";
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
const SELECTED_CARD_LIFT = 52;
const CLICK_MAX_DISTANCE = 24;
const LEFT_POINTER_BUTTON = 0;

type onCardDropCallback = (card: GraphicCard) => void;
type KindCombo = "two-of-a-kind" | "three-of-a-kind";

export interface KindComboSelection {
  kind: KindCombo;
  label: "two of a kind" | "three of a kind";
  cardIds: number[];
  cardType: CardType;
}

type OnKindComboSelectionChange = (
  selection: KindComboSelection | null,
) => void;

interface GraphicHandOptions {
  onKindComboSelectionChange?: OnKindComboSelectionChange;
}

export class GraphicHand {
  #scene: Phaser.Scene;
  #position: Point;
  #cardsData: Map<number, GraphicCard> = new Map();
  #cards: Phaser.GameObjects.Image[] = [];
  #selectedCardIds: number[] = [];
  #hoveredCardImage: Phaser.GameObjects.Image | null = null;
  #onCardDropCallback: onCardDropCallback;
  #onKindComboSelectionChange: OnKindComboSelectionChange | null;
  #isMyTurn: () => boolean;

  constructor(
    scene: Phaser.Scene,
    position: Point,
    onCardDropCallback: onCardDropCallback,
    isMyTurn: () => boolean,
    options: GraphicHandOptions = {},
  ) {
    this.#scene = scene;
    this.#position = position;
    this.#onCardDropCallback = onCardDropCallback;
    this.#onKindComboSelectionChange =
      options.onKindComboSelectionChange ?? null;
    this.#isMyTurn = isMyTurn;
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
        this.updateCardsDraggability();
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
    this.attachCardSelectionHandler(newGraphicCard);

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
    const cardData = card.data;
    const wasSelected = this.#selectedCardIds.includes(cardId);

    this.#cards = this.#cards.filter((c) => c !== cardImage);
    cardImage.off("drop", () => {
      playCard(cardData.id);
    });

    cardImage.disableInteractive();
    cardImage.postFX.clear();
    cardImage.setDepth(0);

    this.#cardsData.delete(cardId);
    if (wasSelected) {
      this.#selectedCardIds = this.#selectedCardIds.filter(
        (id) => id !== cardId,
      );
      this.syncKindComboSelection();
    } else {
      this.reflowCards();
    }

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
      this.playCard(cardData.id);
    });
  }

  private playCard(cardId: number) {
    if (this.#isMyTurn()) {
      playCard(cardId);
    }
  }

  private attachCardSelectionHandler(graphicCard: GraphicCard) {
    let pointerDownPosition: Point | null = null;

    graphicCard.image.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.button !== LEFT_POINTER_BUTTON) return;

      pointerDownPosition = {
        x: pointer.worldX,
        y: pointer.worldY,
      };
    });

    graphicCard.image.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (!pointerDownPosition) return;
      if (pointer.button !== LEFT_POINTER_BUTTON) {
        pointerDownPosition = null;
        return;
      }

      const distance = Phaser.Math.Distance.Between(
        pointerDownPosition.x,
        pointerDownPosition.y,
        pointer.worldX,
        pointer.worldY,
      );
      pointerDownPosition = null;

      if (distance > CLICK_MAX_DISTANCE) return;

      this.toggleKindComboSelection(graphicCard);
    });
  }

  private toggleKindComboSelection(graphicCard: GraphicCard) {
    const cardId = graphicCard.data.id;
    if (this.#selectedCardIds.includes(cardId)) {
      this.#selectedCardIds = [];
      this.syncKindComboSelection();
      return;
    }

    const selectedCards = this.getSelectedGraphicCards();
    const selectedType = selectedCards[0]?.data.type;
    const isDifferentType =
      selectedType && selectedType !== graphicCard.data.type;

    if (isDifferentType) {
      this.#selectedCardIds = [cardId];
    } else if (this.#selectedCardIds.length < 3) {
      this.#selectedCardIds = [...this.#selectedCardIds, cardId];
    }

    this.syncKindComboSelection();
  }

  private syncKindComboSelection() {
    this.updateCardsDraggability();
    this.reflowCards();
    this.#onKindComboSelectionChange?.(this.getKindComboSelection());
  }

  private getKindComboSelection(): KindComboSelection | null {
    const selectedCards = this.getSelectedGraphicCards();
    const selectedCardsAmount = selectedCards.length;

    if (selectedCardsAmount !== 2 && selectedCardsAmount !== 3) return null;

    const selectedCard = selectedCards[0]!;
    const kind =
      selectedCardsAmount === 2 ? "two-of-a-kind" : "three-of-a-kind";
    const label =
      selectedCardsAmount === 2 ? "two of a kind" : "three of a kind";

    return {
      kind,
      label,
      cardIds: selectedCards.map((card) => card.data.id),
      cardType: selectedCard.data.type,
    };
  }

  private attachCardHoverHandler(cardImage: Phaser.GameObjects.Image) {
    cardImage.on("pointerover", () => {
      this.#hoveredCardImage = cardImage;
      this.reflowCards();
    });

    cardImage.on("pointerout", () => {
      if (this.#hoveredCardImage === cardImage) {
        this.#hoveredCardImage = null;
      }

      this.reflowCards();
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
    this.#scene.tweens.killTweensOf(this.#cards);

    const { spacing, startX } = this.getLayout();

    this.#cards.forEach((card, index) => {
      const { x, y } = this.getCardTargetPosition(card, index, {
        spacing,
        startX,
      });

      card.setDepth(index + 1);

      this.#scene.tweens.add({
        targets: card,
        x: x,
        y,
        duration: 250,
        ease: "Back.Out",
      });
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

  private hasKindComboSelection() {
    return this.#selectedCardIds.length > 0;
  }

  private updateCardsDraggability() {
    if (this.#cards.length === 0) return;

    this.#scene.input.setDraggable(this.#cards, !this.hasKindComboSelection());
  }

  private getSelectedGraphicCards() {
    return this.#selectedCardIds
      .map((cardId) => this.#cardsData.get(cardId))
      .filter((card): card is GraphicCard => Boolean(card))
      .sort(
        (firstCard, secondCard) =>
          this.#cards.indexOf(firstCard.image) -
          this.#cards.indexOf(secondCard.image),
      );
  }

  private getCardTargetPosition(
    cardImage: Phaser.GameObjects.Image,
    index: number,
    layout: { spacing: number; startX: number },
  ) {
    const hoveredIndex = this.#hoveredCardImage
      ? this.#cards.indexOf(this.#hoveredCardImage)
      : -1;
    const hoverOffset = this.getHoverOffset(index, hoveredIndex);
    const x = layout.startX + layout.spacing * index + hoverOffset;
    const y = this.#position.y - this.getCardLift(cardImage);

    return { x, y };
  }

  private getCardLift(cardImage: Phaser.GameObjects.Image) {
    if (cardImage === this.#hoveredCardImage) return HOVER_LIFT;

    const cardData = this.getGraphicCardByImage(cardImage)?.data;
    if (cardData && this.#selectedCardIds.includes(cardData.id)) {
      return SELECTED_CARD_LIFT;
    }

    return 0;
  }

  private getGraphicCardByImage(cardImage: Phaser.GameObjects.Image) {
    return [...this.#cardsData.values()].find(
      (card) => card.image === cardImage,
    );
  }

  private getHoverOffset(index: number, hoveredIndex: number) {
    if (hoveredIndex === -1 || index === hoveredIndex) return 0;

    return index < hoveredIndex ? -HOVER_OFFSET : HOVER_OFFSET;
  }
}
