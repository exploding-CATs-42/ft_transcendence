// Libraries
import { Scene } from "phaser";
// Project level
import { Scenes, Textures } from "game/constants";
import {
  EventBus,
  addBackgroundImage,
  addFullscreenToggle,
  addPlayers,
} from "game/utils";
import type { Player } from "game/entities";

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

const CARDS_TO_DEAL = 7;
const HAND_Y = 940; // y position of the player's hand

const MIN_CARD_SPACING = 60;
const MAX_CARD_SPACING = 120;

const BIGGEST_DEPTH = 100;

const DRAW_PILE_X = 610;
const DRAW_PILE_Y = 470;

export class GameRoom extends Scene {
  constructor() {
    super(Scenes.GameRoom);
  }

  create() {
    addBackgroundImage(this, Textures.gameRoomBg);
    addFullscreenToggle(this);
    addPlayers(this, data.players, "white", "black");

    this.createDrawPile();
    this.addCards();

    EventBus.emit("current-scene-ready", this);
  }

  private createDrawPile() {
    const cardCover = this.textures.get(Textures.cardCover).get();
    this.addCard(DRAW_PILE_X, DRAW_PILE_Y, cardCover);
  }

  private addCards() {
    const spacing = this.getCardSpacing(CARDS_TO_DEAL);
    let x = this.getHandStartX(CARDS_TO_DEAL, spacing);

    for (let i = 0; i < CARDS_TO_DEAL; ++i) {
      const frame = this.textures.get(Textures.cards).get(i);
      this.addCard(x, HAND_Y, frame).setDepth(i + 1);

      x += spacing;
    }
  }

  private addCard(x: number, y: number, frame: Phaser.Textures.Frame) {
    const card = this.add
      .image(x, y, frame.texture.key, frame.name)
      .setDisplaySize(CARD_WIDTH, CARD_HEIGHT)
      .setOrigin(0, 0)
      .setInteractive({
        draggable: true,
        useHandCursor: true,
      });

    this.attachCardDragHandlers(card);

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

  private getCardSpacing(cardCount: number): number {
    const MIN_SPACING = MIN_CARD_SPACING; // many cards
    const MAX_SPACING = MAX_CARD_SPACING; // few cards
    const MAX_COUNT = 20;

    if (cardCount <= 1) return MAX_SPACING;
    if (cardCount >= MAX_COUNT) return MIN_SPACING;

    // Calculate how full the hand is.
    // If we have 1 card - it's empty
    // If we have 20+ cards it's full
    // The progress is a value from 0 to 1 (0% -> 100%)
    const progress = (cardCount - 1) / (MAX_COUNT - 1);
    const SPACE_TO_SHRINK = MAX_SPACING - MIN_SPACING;

    // Decrease the spacing on some amount
    // from the amount of on how much spacing can shrink
    // depending on how full the hand is
    // or in other words:
    // the more cards we have
    // the bigger will be progress
    // and therefore the bigger will be (progress * SPACE_TO_SHRINK)
    // thus the smaller will be the spacing
    const spacing = MAX_SPACING - progress * SPACE_TO_SHRINK;

    return spacing;
  }

  private getHandStartX(cardCount: number, spacing: number): number {
    if (cardCount === 0) return this.scale.width / 2 - CARD_WIDTH / 2;

    const handWidth = (cardCount - 1) * spacing + CARD_WIDTH;
    const startX = this.scale.width / 2 - handWidth / 2;

    return startX;
  }
}
