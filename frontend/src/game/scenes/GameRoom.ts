// Libraries
import { Scene } from "phaser";
// Project level
import type { Card, CardPayload } from "@exploding-cats/game-core";
import type { HandPayload } from "@exploding-cats/contracts";
// Local level
import {
  Scenes,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  GAME_ROOM_SEATS,
  Textures,
  CARD_TYPE_TO_FRAME as CARD_TYPE_TO_FRAME_INDEX,
} from "../constants";
import {
  EventBus,
  addBackgroundImage,
  addCardVisual,
  addFullscreenToggle,
  getCardFrame,
} from "../utils";
import {
  GraphicPlayer,
  GraphicHand,
  OpponentHand,
  PlayerSeat,
  type GraphicCard,
} from "../entities";
import type { Point, LabelConfig, CardConfig, Player } from "../@types";
import {
  attachGameRoomSockets,
  drawCard,
  type CleanupFunction,
  type GameRoomHandlers,
  type GameStartedPayload,
} from "../sockets";
import { fakeCards, fakePlayers } from "./mockData";

// Opponents
const NAME_LABEL_CONFIG: LabelConfig = {
  fontColor: "white",
  strokeColor: "black",
};

const OPPONENT_HAND_X_OFFSET = 96;
const OPPONENT_HAND_Y_OFFSET = 180;

// Draw and discard piles
const CARD_WIDTH = 186 * 1.5;
const CARD_HEIGHT = 260 * 1.5;
const CARD_BORDER_RADIUS = 20;

const PILES_Y = 410;
const DRAW_PILE_POSITION: Point = {
  x: 560,
  y: PILES_Y,
};
const DISCARD_PILE_POSITION: Point = {
  x: 1050,
  y: PILES_Y,
};

const CARD_DROP_ZONE = {
  x: 400,
  y: 340,
  width: 1090,
  height: 540,
};

// My hand
const HAND_POSITION: Point = {
  x: SCREEN_WIDTH / 2,
  y: 940,
};

export class GameRoom extends Scene implements GameRoomHandlers {
  #players: Map<string, PlayerSeat> = new Map();
  #opponents: Map<string, OpponentHand> = new Map();
  #myHand!: GraphicHand;
  #detachSockets: CleanupFunction;
  #tempDataStorage: GameStartedPayload = {
    players: fakePlayers,
    hand: { cards: fakeCards },
  };

  constructor() {
    super(Scenes.GameRoom);

    this.#detachSockets = attachGameRoomSockets(this);
  }

  create() {
    const { hand, players } = this.#tempDataStorage;

    addBackgroundImage(this, Textures.gameRoomBg);
    addFullscreenToggle(this);

    const graphicPlayers = this.createPlayers(players);
    this.createOpponentHands(graphicPlayers);
    this.fillOpponentHands(hand.cards.length);
    this.fillSeats(graphicPlayers);

    this.createCardDropZone();
    this.createDrawPile();
    this.createDiscardPile();
    this.createMyHand();
    this.fillMyHandWithCards(hand.cards);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup);

    EventBus.emit("scene-ready", this);
  }

  private createPlayers(players: Player[]) {
    return players.map((player) => {
      return new GraphicPlayer(this, { x: 0, y: 0 }, player, NAME_LABEL_CONFIG);
    });
  }

  private fillSeats(players: GraphicPlayer[]) {
    const me = players[0]!;
    const mySeat = new PlayerSeat(this, GAME_ROOM_SEATS[0]!);
    mySeat.addPlayer(me);
    this.#players.set(me.id, mySeat);

    for (let i = 1; i < players.length; ++i) {
      const opponent = players[i]!;
      const opponentSeat = new PlayerSeat(this, GAME_ROOM_SEATS[i]!);
      opponentSeat.addPlayer(opponent);
      opponentSeat.addHand(this.#opponents.get(opponent.id)!);

      this.#players.set(opponent.id, opponentSeat);
    }
  }

  private createMyHand() {
    const onCardDrop = (card: GraphicCard) => {
      // move it to the discard pile and shrink it down to pile size
      this.tweens.add({
        targets: card.image,
        x: DISCARD_PILE_POSITION.x,
        y: DISCARD_PILE_POSITION.y,
        displayWidth: CARD_WIDTH,
        displayHeight: CARD_HEIGHT,
        duration: 300,
        ease: "Back.Out",
      });

      // REMOVE THIS LATER
      console.log(card.data.type);
    };

    this.#myHand = new GraphicHand(this, HAND_POSITION, onCardDrop);
  }

  private fillMyHandWithCards(cards: Card[]) {
    cards.forEach((card) => {
      const frameIndex = CARD_TYPE_TO_FRAME_INDEX[card.type];
      const frame = getCardFrame(this, frameIndex);
      this.#myHand.addCard(card, frame);
    });
  }

  private createOpponentHands(players: GraphicPlayer[]) {
    for (let i = 1; i < players.length; ++i) {
      const x = OPPONENT_HAND_X_OFFSET;
      const y = OPPONENT_HAND_Y_OFFSET;

      const hand = new OpponentHand(this, { x, y });
      const opponent = players[i]!;
      this.#opponents.set(opponent.id, hand);
    }
  }

  private fillOpponentHands(cardsPerPlayer: number) {
    this.#opponents.forEach((opponentHand) => {
      for (let i = 0; i < cardsPerPlayer; ++i) {
        opponentHand.addCard();
      }
    });
  }

  private createDrawPile() {
    const cardCover = this.textures.get(Textures.cardCover).get();
    const drawPile = this.addCard(cardCover, DRAW_PILE_POSITION);

    drawPile.setInteractive({ useHandCursor: true });
    drawPile.on("pointerdown", this.drawCard);
  }

  private createDiscardPile() {
    const cardFrame = this.textures.get(Textures.cards).get(0);
    this.addCard(cardFrame, DISCARD_PILE_POSITION);
  }

  private addCard(frame: Phaser.Textures.Frame, position: Point) {
    const cardConfig = this.buildCardConfig(frame);
    const card = addCardVisual(this, position, cardConfig, CARD_BORDER_RADIUS);
    return card;
  }

  private createCardDropZone() {
    const { x, y, width, height } = CARD_DROP_ZONE;
    const zone = this.add.zone(x, y, width, height).setOrigin(0, 0);
    zone.setRectangleDropZone(width, height);
  }

  private drawCard = () => {
    drawCard();
  };

  private buildCardConfig(frame: Phaser.Textures.Frame): CardConfig {
    return {
      frame: frame,
      size: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      },
    };
  }

  onGameStarted(payload: { players: Player[]; hand: HandPayload }): void {
    this.#tempDataStorage = payload;
  }

  onCardReceived = (payload: CardPayload): void => {
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
    const faceDownCard = this.addCard(cardCover, DRAW_PILE_POSITION);

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
        const card: Card = payload.card;

        const frameIndex = CARD_TYPE_TO_FRAME_INDEX[card.type];
        const frame = getCardFrame(this, frameIndex);
        this.#myHand.addCard(card, frame, insertIndex);
      },
    });
  };

  private cleanup = () => {
    this.#detachSockets();

    // Remove whichever event didn't fire
    this.events.off(Phaser.Scenes.Events.SHUTDOWN, this.cleanup);
    this.events.off(Phaser.Scenes.Events.DESTROY, this.cleanup);
  };
}
