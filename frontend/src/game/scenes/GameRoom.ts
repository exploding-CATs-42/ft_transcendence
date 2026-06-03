// Libraries
import { Scene } from "phaser";
// Project level
import { Scenes, SCREEN_WIDTH, SEATS, Textures } from "game/constants";
import {
  EventBus,
  addBackgroundImage,
  addCardVisual,
  addFullscreenToggle,
  addPlayers,
  getCardSpacing,
  getHandStartX,
} from "game/utils";
import { OpponentHand, type GraphicPlayer, type Player } from "game/entities";
import type { Point, Size, SpacingConfig } from "game/@types";

// It's just a placeholder and has to be removed later
const data: { players: Player[] } = {
  players: [
    { username: "You", imageUrl: null },
    { username: "Player 2", imageUrl: null },
    { username: "Player 3", imageUrl: null },
    { username: "Player 4", imageUrl: null },
    { username: "Player 5", imageUrl: null },
  ],
};

const CARD_WIDTH = 186;
const CARD_HEIGHT = 260;
const CARD_BORDER_RADIUS = 20;

const CARDS_TO_DEAL = 7;
const HAND_Y = 940; // y position of the player's hand

const CARD_SPACING_CONFIG: SpacingConfig = {
  minSpacing: 60,
  maxSpacing: 120,
  cardsBeforeMinSpacing: 20,
};

const BIGGEST_DEPTH = 100;

const PILE_Y = 470;
const DRAW_PILE_X = 610;
const DRAW_PILE_Y = PILE_Y;
const DISCARD_PILE_X = 1100;
const DISCARD_PILE_Y = PILE_Y;

const CARD_DROP_ZONE = {
  x: 400,
  y: 340,
  width: 1090,
  height: 540,
};

const HOVER_LIFT = 30; // How many px the hovered card rises
const HOVER_OFFSET = CARD_WIDTH / 4; // How many px surrounding cards move to the side

const OPPONENT_HAND_X_OFFSET = 96;
const OPPONENT_HAND_Y_OFFSET = 180;

export class GameRoom extends Scene {
  #cards: Phaser.GameObjects.Image[] = [];

  constructor() {
    super(Scenes.GameRoom);
  }

  create() {
    addBackgroundImage(this, Textures.gameRoomBg);
    addFullscreenToggle(this);

    const players = addPlayers(this, data.players, "white", "black");
    this.createOpponentHands(players);

    this.createCardDropZone();
    this.createDrawPile();
    this.createDiscardPile();
    this.dealCards();

    EventBus.emit("scene-ready", this);
  }

  private createOpponentHands(players: GraphicPlayer[]) {
    for (let i = 1; i < players.length; ++i) {
      const x = SEATS[i]!.x + OPPONENT_HAND_X_OFFSET;
      const y = SEATS[i]!.y + OPPONENT_HAND_Y_OFFSET;

      const hand = new OpponentHand(this, { x, y });

      // Demonstration code
      let count = 0;
      const intervalId = setInterval(() => {
        if (count < 7) hand.addCard();
        else hand.removeCard();
        count++;

        if (count === 14) {
          clearInterval(intervalId);
        }
      }, 500);
    }
  }

  private createDrawPile() {
    const cardCover = this.textures.get(Textures.cardCover).get();
    const drawPile = this.addCard(
      DRAW_PILE_X,
      DRAW_PILE_Y,
      cardCover,
    ).setInteractive({ useHandCursor: true });

    drawPile.on("pointerdown", this.drawCard);
  }

  private createDiscardPile() {
    const cardFrame = this.textures.get(Textures.cards).get(0);
    this.addCard(DISCARD_PILE_X, DISCARD_PILE_Y, cardFrame);
  }

  private dealCards() {
    const spacing = getCardSpacing(CARDS_TO_DEAL, CARD_SPACING_CONFIG);
    let x = getHandStartX(CARDS_TO_DEAL, spacing, CARD_WIDTH, SCREEN_WIDTH / 2);

    for (let i = 0; i < CARDS_TO_DEAL; ++i) {
      const frame = this.getRandomCardFrame();
      const card = this.addInteractiveCard(x, HAND_Y, frame).setDepth(i + 1);
      this.#cards.push(card);

      x += spacing;
    }
  }

  private addCard(
    x: number,
    y: number,
    frame: Phaser.Textures.Frame,
    width = CARD_WIDTH,
    height = CARD_HEIGHT,
  ) {
    const position: Point = { x, y };
    const size: Size = { width, height };
    const card = addCardVisual(
      this,
      position,
      { frame, size },
      CARD_BORDER_RADIUS,
    );

    return card;
  }

  private addInteractiveCard(
    x: number,
    y: number,
    frame: Phaser.Textures.Frame,
  ): Phaser.GameObjects.Image {
    const card = this.addCard(x, y, frame).setInteractive({
      draggable: true,
      useHandCursor: true,
    });

    this.attachCardDragHandlers(card);
    this.attachCardDropHandler(card);
    this.attachCardHoverHandler(card);

    return card;
  }

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

      this.tweens.add({
        targets: card,
        x: originX,
        y: HAND_Y,
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
      // Remove card from player's hand
      this.#cards = this.#cards.filter((c) => c !== card);

      // make it non-interactive
      card.off("drop", onCardDrop);
      card.disableInteractive();

      // move it to the discard pile
      this.tweens.add({
        targets: card,
        x: DISCARD_PILE_X,
        y: DISCARD_PILE_Y,
        duration: 300,
        ease: "Back.Out",
      });

      // update it's depth to the lowest
      card.setDepth(0);

      // and reflow cards in player's hand
      this.reflowCards();
    };

    card.on("drop", onCardDrop);
  }

  private attachCardHoverHandler(card: Phaser.GameObjects.Image) {
    const tween = (target: Phaser.GameObjects.Image, props: object) => {
      this.tweens.add({
        targets: target,
        duration: 120,
        ease: "Power2",
        ...props,
      });
    };

    const getLayout = () => {
      const spacing = getCardSpacing(this.#cards.length, CARD_SPACING_CONFIG);
      const startX = getHandStartX(
        this.#cards.length,
        spacing,
        CARD_WIDTH,
        SCREEN_WIDTH / 2,
      );

      const getBaseX = (index: number) => startX + index * spacing;

      return { getBaseX };
    };

    const applyHoverLayout = (hoveredIndex: number) => {
      const { getBaseX } = getLayout();

      this.#cards.forEach((card, index) => {
        if (index === hoveredIndex) return;

        const offset = index < hoveredIndex ? -HOVER_OFFSET : HOVER_OFFSET;

        tween(card, {
          x: getBaseX(index) + offset,
        });
      });
    };

    const resetLayout = () => {
      const { getBaseX } = getLayout();

      this.#cards.forEach((c, index) => {
        tween(c, {
          x: getBaseX(index),
        });
      });
    };

    const liftCard = () => {
      tween(card, { y: HAND_Y - HOVER_LIFT });
    };

    const lowerCard = () => {
      tween(card, { y: HAND_Y });
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

  private reflowCards() {
    const spacing = getCardSpacing(this.#cards.length, CARD_SPACING_CONFIG);
    let x = getHandStartX(
      this.#cards.length,
      spacing,
      CARD_WIDTH,
      SCREEN_WIDTH / 2,
    );

    this.#cards.forEach((card, index) => {
      card.setDepth(index);

      this.tweens.add({
        targets: card,
        x: x,
        y: HAND_Y,
        duration: 250,
        ease: "Back.Out",
      });

      x += spacing;
    });
  }

  private createCardDropZone() {
    const { x, y, width, height } = CARD_DROP_ZONE;
    const zone = this.add.zone(x, y, width, height).setOrigin(0, 0);
    zone.setRectangleDropZone(width, height);
  }

  private drawCard = () => {
    // Generate random insert index
    const insertIndex = Phaser.Math.Between(0, this.#cards.length);
    // Calculate current card spacing
    const spacing = getCardSpacing(this.#cards.length, CARD_SPACING_CONFIG);

    // Using that spacing calculate where to insert the card
    let targetX;
    if (this.#cards.length === 0)
      targetX = getHandStartX(1, spacing, CARD_WIDTH, SCREEN_WIDTH / 2);
    else if (insertIndex === 0) targetX = this.#cards[0]!.x - spacing / 2;
    else targetX = this.#cards[insertIndex - 1]!.x + spacing / 2;

    // Update the depth of the cards in player's hand,
    // so that new card doesn't overlay them
    this.#cards.forEach((card, index) => {
      if (index >= insertIndex) card.setDepth(index + 1 + 1);
      else card.setDepth(index + 1);
    });

    // Create face down card
    const cardCover = this.textures.get(Textures.cardCover).get();
    const faceDownCard = this.addCard(DRAW_PILE_X, DRAW_PILE_Y, cardCover);

    // and move it below the screen
    // at the x position calculated earlier
    this.tweens.add({
      targets: faceDownCard,
      x: targetX,
      y: this.scale.height + CARD_HEIGHT / 2,
      duration: 400,
      ease: "Sine.easeInOut",

      onComplete: () => {
        // then destroy it
        faceDownCard.destroy();
        // and spawn the real card into player's hand
        spawnNewCard(targetX, insertIndex);
      },
    });

    const spawnNewCard = (targetX: number, insertIndex: number) => {
      const frame = this.getRandomCardFrame();

      const newCard = this.addInteractiveCard(
        targetX,
        this.scale.height,
        frame,
      ).setDepth(insertIndex);

      this.tweens.add({
        targets: newCard,
        x: targetX,
        y: HAND_Y,
        duration: 500,
        ease: "Back.easeOut",

        onComplete: () => {
          this.#cards.splice(insertIndex, 0, newCard);
          if (this.#cards.length > 1) this.reflowCards();
        },
      });
    };
  };

  private getRandomCardFrame() {
    const cardSpreadsheet = this.textures.get(Textures.cards);
    const frameName = Phaser.Math.RND.pick(cardSpreadsheet.getFrameNames());
    const frame = cardSpreadsheet.get(frameName);
    return frame;
  }
}
