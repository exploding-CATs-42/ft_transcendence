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

const KIND_COMBO_DEPTH = BIGGEST_DEPTH + 1;
const KIND_COMBO_LABEL_OFFSET = 68;
const KIND_COMBO_LABEL_PADDING = {
  x: 34,
  y: 6,
};
const KIND_COMBO_LABEL_SKEW = 26;
const CLICK_MAX_DISTANCE = 24;
const LEFT_POINTER_BUTTON = 0;

const SELECTED_CARD_GLOW_BY_COUNT = {
  1: { color: 0xfff4a8, outerStrength: 2, distance: 8 },
  2: { color: 0xffd45a, outerStrength: 4, distance: 11 },
  3: { color: 0xffa52c, outerStrength: 6, distance: 14 },
} as const;

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
type OnKindComboPlay = () => void;

interface GraphicHandOptions {
  onKindComboSelectionChange?: OnKindComboSelectionChange;
  onKindComboPlay?: OnKindComboPlay;
}

export class GraphicHand {
  #scene: Phaser.Scene;
  #position: Point;
  #cardsData: Map<number, GraphicCard> = new Map();
  #cards: Phaser.GameObjects.Image[] = [];
  #selectedCardIds: number[] = [];
  #hoveredCardImage: Phaser.GameObjects.Image | null = null;
  #kindComboLabelBackground: Phaser.GameObjects.Graphics | null = null;
  #kindComboLabel: Phaser.GameObjects.Text | null = null;
  #kindComboPlayZone: Phaser.GameObjects.Zone | null = null;
  #onCardDropCallback: onCardDropCallback;
  #onKindComboSelectionChange: OnKindComboSelectionChange | null;
  #onKindComboPlay: OnKindComboPlay | null;
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
    this.#onKindComboPlay = options.onKindComboPlay ?? null;
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

    this.attachCardDragHandlers(newGraphicCard);
    this.attachCardDropHandler(newGraphicCard);
    this.attachCardHoverHandler(newGraphicCard.image);
    this.attachCardSelectionHandler(newGraphicCard);

    return newGraphicCard;
  }

  // -------------- Event handlers --------------

  private attachCardDragHandlers(graphicCard: GraphicCard) {
    const cardImage = graphicCard.image;
    let draggedCards: Phaser.GameObjects.Image[] = [];
    let dragOrigins = new Map<
      Phaser.GameObjects.Image,
      { x: number; y: number; depth: number }
    >();

    const onDragStart = () => {
      draggedCards = this.getCardsDraggedWith(graphicCard);
      dragOrigins = new Map(
        draggedCards.map((card) => [
          card,
          {
            x: card.x,
            y: card.y,
            depth: card.depth,
          },
        ]),
      );

      this.#scene.tweens.killTweensOf(draggedCards);
      draggedCards.forEach((card, index) => {
        card.setDepth(BIGGEST_DEPTH + index);
      });
    };

    const onDrag = (
      _pointer: Phaser.Input.Pointer,
      dragX: number,
      dragY: number,
    ) => {
      const draggedCardOrigin = dragOrigins.get(cardImage);
      if (!draggedCardOrigin) return;

      const deltaX = dragX - draggedCardOrigin.x;
      const deltaY = dragY - draggedCardOrigin.y;

      draggedCards.forEach((card) => {
        const origin = dragOrigins.get(card);
        if (!origin) return;

        card.x = origin.x + deltaX;
        card.y = origin.y + deltaY;
      });
    };

    const onDragEnd = () => {
      draggedCards.forEach((card) => {
        const origin = dragOrigins.get(card);
        if (origin) card.setDepth(origin.depth);
      });

      draggedCards = [];
      dragOrigins.clear();
      this.reflowCards();
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
      if (this.canPlayKindComboWithCard(cardData.id)) {
        this.playKindCombo();
        return;
      }

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
    this.updateCardSelectionStyles();
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

    if (this.hasKindComboSelection()) {
      this.updateKindComboLabel();
    } else {
      this.hideKindComboLabel();
    }
  }

  private updateKindComboLabel() {
    const selection = this.getKindComboSelection();
    if (!selection) {
      this.hideKindComboLabel();
      return;
    }

    const selectedCards = this.getSelectedGraphicCards();
    const selectedBounds = this.getSelectedCardsBounds(selectedCards);
    const x = (selectedBounds.left + selectedBounds.right) / 2;
    const y = selectedBounds.top - KIND_COMBO_LABEL_OFFSET;

    if (!this.#kindComboLabel) {
      this.#kindComboLabel = this.#scene.add
        .text(x, y, selection.label, {
          color: "#ffffff",
          fontFamily: "Chewy",
          fontSize: "34px",
          fontStyle: "bold",
        })
        .setOrigin(0.5, 0.5)
        .setStroke("#190b04", 8)
        .setShadow(3, 4, "#6b2600", 2)
        .setDepth(KIND_COMBO_DEPTH + 10);
    }

    this.#kindComboLabel
      .setText(selection.label.toUpperCase())
      .setPosition(x, y)
      .setVisible(true);

    this.updateKindComboLabelBackground(x, y, this.#kindComboLabel);
    this.updateKindComboPlayZone(x, y, this.#kindComboLabel);
  }

  private hideKindComboLabel() {
    this.#kindComboLabelBackground?.setVisible(false);
    this.#kindComboLabel?.setVisible(false);
    this.#kindComboPlayZone?.disableInteractive();
    this.#kindComboPlayZone?.setVisible(false);
  }

  private updateCardSelectionStyles() {
    const selectedCardIds = new Set(this.#selectedCardIds);
    const selectedCardsCount = Math.min(this.#selectedCardIds.length, 3);
    const glowConfig =
      selectedCardsCount > 0
        ? SELECTED_CARD_GLOW_BY_COUNT[selectedCardsCount as 1 | 2 | 3]
        : null;

    this.#cardsData.forEach((card) => {
      card.image.postFX.clear();

      if (!selectedCardIds.has(card.data.id) || !glowConfig) return;

      card.image.postFX.addGlow(
        glowConfig.color,
        glowConfig.outerStrength,
        0,
        false,
        0.1,
        glowConfig.distance,
      );
    });
  }

  private updateKindComboLabelBackground(
    x: number,
    y: number,
    label: Phaser.GameObjects.Text,
  ) {
    if (!this.#kindComboLabelBackground) {
      this.#kindComboLabelBackground = this.#scene.add
        .graphics()
        .setDepth(KIND_COMBO_DEPTH + 9);
    }

    const width = label.width + KIND_COMBO_LABEL_PADDING.x * 2;
    const height = label.height + KIND_COMBO_LABEL_PADDING.y * 2;
    const left = x - width / 2;
    const top = y - height / 2;
    const graphics = this.#kindComboLabelBackground;

    graphics.clear();
    this.drawKindComboLabelLayer(
      graphics,
      left - 46,
      top - 22,
      width + 92,
      height + 44,
      KIND_COMBO_LABEL_SKEW + 30,
      0xfff000,
      0.12,
    );
    this.drawKindComboLabelLayer(
      graphics,
      left - 28,
      top - 13,
      width + 56,
      height + 26,
      KIND_COMBO_LABEL_SKEW + 18,
      0xfff36b,
      0.22,
    );
    this.drawKindComboLabelLayer(
      graphics,
      left - 12,
      top - 6,
      width + 24,
      height + 12,
      KIND_COMBO_LABEL_SKEW + 8,
      0xff8a00,
      0.36,
    );
    this.drawKindComboLabelLayer(
      graphics,
      left,
      top,
      width,
      height,
      KIND_COMBO_LABEL_SKEW,
      0xffcf24,
      0.92,
    );
    this.drawKindComboLabelLayer(
      graphics,
      left + 8,
      top + 5,
      width - 18,
      height * 0.38,
      KIND_COMBO_LABEL_SKEW - 4,
      0xffff9d,
      0.42,
    );

    graphics
      .lineStyle(3, 0x3a1600, 0.65)
      .beginPath()
      .moveTo(left + KIND_COMBO_LABEL_SKEW, top)
      .lineTo(left + width, top)
      .lineTo(left + width - KIND_COMBO_LABEL_SKEW, top + height)
      .lineTo(left, top + height)
      .closePath()
      .strokePath()
      .setVisible(true);
  }

  private updateKindComboPlayZone(
    x: number,
    y: number,
    label: Phaser.GameObjects.Text,
  ) {
    const width = label.width + KIND_COMBO_LABEL_PADDING.x * 2 + 92;
    const height = label.height + KIND_COMBO_LABEL_PADDING.y * 2 + 44;

    if (!this.#kindComboPlayZone) {
      this.#kindComboPlayZone = this.#scene.add
        .zone(x, y, width, height)
        .setOrigin(0.5)
        .setDepth(KIND_COMBO_DEPTH + 11);

      this.#kindComboPlayZone.on("pointerdown", this.playKindCombo);
    }

    this.#kindComboPlayZone
      .setPosition(x, y)
      .setSize(width, height)
      .setInteractive({ useHandCursor: true })
      .setVisible(true);
  }

  private playKindCombo = () => {
    this.#onKindComboPlay?.();
  };

  private drawKindComboLabelLayer(
    graphics: Phaser.GameObjects.Graphics,
    left: number,
    top: number,
    width: number,
    height: number,
    skew: number,
    color: number,
    alpha: number,
  ) {
    graphics
      .fillStyle(color, alpha)
      .beginPath()
      .moveTo(left + skew, top)
      .lineTo(left + width, top)
      .lineTo(left + width - skew, top + height)
      .lineTo(left, top + height)
      .closePath()
      .fillPath();
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

    const selection = this.getKindComboSelection();
    const selectedCardIds = new Set(this.#selectedCardIds);

    this.#cardsData.forEach((card) => {
      const isSelectedComboCard =
        selection !== null && selectedCardIds.has(card.data.id);

      this.#scene.input.setDraggable(
        card.image,
        !this.hasKindComboSelection() || isSelectedComboCard,
      );
    });
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

  private getSelectedCardsBounds(selectedCards: GraphicCard[]) {
    const { spacing, startX } = this.getLayout();
    const selectedPositions = selectedCards.map((card) => {
      const index = this.#cards.indexOf(card.image);
      return this.getKindComboLabelAnchorPosition(index, { spacing, startX });
    });
    const left = Math.min(...selectedPositions.map((position) => position.x));
    const right =
      Math.max(...selectedPositions.map((position) => position.x)) + CARD_WIDTH;
    const top = Math.min(...selectedPositions.map((position) => position.y));

    return { left, right, top };
  }

  private getKindComboLabelAnchorPosition(
    index: number,
    layout: { spacing: number; startX: number },
  ) {
    return {
      x: layout.startX + layout.spacing * index,
      y: this.#position.y - SELECTED_CARD_LIFT,
    };
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

  private getCardsDraggedWith(graphicCard: GraphicCard) {
    if (!this.canPlayKindComboWithCard(graphicCard.data.id)) {
      return [graphicCard.image];
    }

    return this.getSelectedGraphicCards().map((card) => card.image);
  }

  private canPlayKindComboWithCard(cardId: number) {
    return (
      this.getKindComboSelection() !== null &&
      this.#selectedCardIds.includes(cardId)
    );
  }

  private getHoverOffset(index: number, hoveredIndex: number) {
    if (hoveredIndex === -1 || index === hoveredIndex) return 0;

    return index < hoveredIndex ? -HOVER_OFFSET : HOVER_OFFSET;
  }
}
