// Libraries
import { Scene } from "phaser";
// Project level
import {
  Scenes,
  SCREEN_WIDTH,
  SEATS,
  Textures,
  SCREEN_HEIGHT,
} from "game/constants";
import {
  EventBus,
  addBackgroundImage,
  addCardVisual,
  addFullscreenToggle,
} from "game/utils";
import {
  OpponentHand,
  GraphicPlayer,
  type Player,
  Hand,
  PlayerSeat,
} from "game/entities";
import type { Point, Size, LabelConfig } from "game/@types";

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

// Opponents
const NAME_LABEL_CONFIG: LabelConfig = {
  fontColor: "white",
  strokeColor: "black",
};

const OPPONENT_HAND_X_OFFSET = 96;
const OPPONENT_HAND_Y_OFFSET = 180;

// My hand
const HAND_POSITION: Point = {
  x: SCREEN_WIDTH / 2,
  y: 940,
};

export class GameRoom extends Scene {
  #seats: PlayerSeat[] = [];
  #opponentHands: OpponentHand[] = [];
  #myHand!: Hand;

  constructor() {
    super(Scenes.GameRoom);
  }

  create() {
    addBackgroundImage(this, Textures.gameRoomBg);
    addFullscreenToggle(this);

    const players = this.createPlayers(data.players);
    this.createOpponentHands(players);
    this.fillSeats(players);

    this.createCardDropZone();
    this.createDrawPile();
    this.createDiscardPile();
    this.createMyHand();

    EventBus.emit("scene-ready", this);
  }

  private createPlayers(players: Player[]) {
    return players.map((player) => {
      return new GraphicPlayer(this, { x: 0, y: 0 }, player, NAME_LABEL_CONFIG);
    });
  }

  private fillSeats(players: GraphicPlayer[]) {
    const mySeat = new PlayerSeat(this, SEATS[0]!);
    mySeat.addPlayer(players[0]!);
    this.#seats.push(mySeat);

    for (let i = 1; i < players.length; ++i) {
      const opponentSeat = new PlayerSeat(this, SEATS[i]!);
      opponentSeat.addPlayer(players[i]!);
      opponentSeat.addHand(this.#opponentHands[i - 1]!);

      this.#seats.push(opponentSeat);
    }
  }

  private createMyHand() {
    const onCardDrop = (card: Phaser.GameObjects.Image) => {
      // move it to the discard pile
      this.tweens.add({
        targets: card,
        x: DISCARD_PILE_X,
        y: DISCARD_PILE_Y,
        duration: 300,
        ease: "Back.Out",
      });
    };

    this.#myHand = new Hand(this, HAND_POSITION, onCardDrop);
  }

  private createOpponentHands(players: GraphicPlayer[]) {
    for (let i = 1; i < players.length; ++i) {
      const x = OPPONENT_HAND_X_OFFSET;
      const y = OPPONENT_HAND_Y_OFFSET;

      const hand = new OpponentHand(this, { x, y });
      this.#opponentHands.push(hand);

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

  private createCardDropZone() {
    const { x, y, width, height } = CARD_DROP_ZONE;
    const zone = this.add.zone(x, y, width, height).setOrigin(0, 0);
    zone.setRectangleDropZone(width, height);
  }

  private drawCard = () => {
    // Generate random insert index
    const cardCount = this.#myHand.getCount();
    const insertIndex = Phaser.Math.Between(0, cardCount);

    // Get current card spacing and most left card position
    const { startX, spacing } = this.#myHand.getLayout();

    // Using that calculate where to insert the card
    let targetX;
    if (cardCount === 0) targetX = HAND_POSITION.x;
    else targetX = startX + spacing * insertIndex - spacing / 2;

    // Create face down card
    const cardCover = this.textures.get(Textures.cardCover).get();
    const faceDownCard = this.addCard(DRAW_PILE_X, DRAW_PILE_Y, cardCover);

    // and move it below the screen
    // at the x position calculated earlier
    this.tweens.add({
      targets: faceDownCard,
      x: targetX,
      y: SCREEN_HEIGHT + CARD_HEIGHT / 2,
      duration: 400,
      ease: "Sine.easeInOut",

      onComplete: () => {
        // then destroy it
        faceDownCard.destroy();
        // and spawn the real card into player's hand
        this.#myHand.addCard(insertIndex);
      },
    });
  };
}
