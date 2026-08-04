// Libraries
import { Scene } from "phaser";
// Project level
import {
  CardType,
  GameStates,
  type Card,
  type CardPayload,
  type GameOverPayload,
  type KittenInsertedPayload,
  type PlayerDefusedPayload,
  type PlayerSelectedPayload,
  type WaitingForFavorCardSelectionPayload,
} from "@exploding-cats/game-core";
import {
  CardRemovalReason,
  type CardGivenPayload,
  type CardPlayedPayload,
  type CardRemovedPayload,
  type ComboPlayedPayload,
  type DefusePromptPayload,
  type GameStatePayload,
  type NopePlayedPayload,
  type PlayerIdPayload,
  type PublicPlayerView,
  type SeeTheFuturePeekPayload,
  type TurnChangedPayload,
  type TurnSkippedPayload,
} from "@exploding-cats/contracts";
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
  Button,
  Modal,
  SkipView,
  type GraphicCard,
  type CardPlaySelection,
  SeeTheFutureView,
  ExplodingKittenDrawnView,
  ExplodingKittenInsertionView,
  NopeButton,
  DefuseView,
  Notification,
  NotificationMode,
  ExplodingKittenRiskBar,
} from "../entities";
import type { Point, LabelConfig, CardConfig, Player } from "../@types";
import {
  attachGameRoomSockets,
  getCachedGameState,
  drawCard,
  playDefuse,
  giveCard,
  leaveCurrentGame,
  playCard,
  playCombo,
  playNope,
  selectPlayer,
  type CleanupFunction,
  type GameRoomHandlers,
  insertKitten,
  seenTheFuture,
} from "../sockets";
import { ShuffleAnimation } from "../animations";

// -------------------- OPPONENTS --------------------
const NAME_LABEL_CONFIG: LabelConfig = {
  fontColor: "white",
  strokeColor: "black",
};

const OPPONENT_HAND_X_OFFSET = 96;
const OPPONENT_HAND_Y_OFFSET = 180;

// -------------- DRAW AND DISCARD PILES --------------
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

const CARDS_LEFT_LABEL: Point = {
  x: 485,
  y: PILES_Y + 170,
};

const CARD_TO_DISCARD_DURATION_MS = 300;
const CARD_TO_DISCARD_EASE = "Back.Out";

const CARD_FROM_DRAW_PILE_DURATION_MS = 400;
const CARD_FROM_DRAW_PILE_EASE = "Sine.easeInOut";

const CARD_TO_DRAW_PILE_DURATION_MS = 600;
const CARD_TO_DRAW_PILE_EASE = "Cubic.easeInOut";
const FLYING_CARD_DEPTH = 1000;

// Odd number of half turns, so the card lands face down on the pile
const CARD_FLIP_HALF_TURNS = 1;
const CARD_FLIP_HALF_TURN_DURATION_MS =
  CARD_TO_DRAW_PILE_DURATION_MS / (CARD_FLIP_HALF_TURNS * 2);

const DRAW_PILE_PULSE_SCALE = 1.08;
const DRAW_PILE_PULSE_DURATION_MS = 120;

const CARD_DROP_ZONE = {
  x: 400,
  y: 340,
  width: 1090,
  height: 540,
};

const SHUFFLE_ANIMATION_POSITION = {
  x: DRAW_PILE_POSITION.x + 110,
  y: DRAW_PILE_POSITION.y + 160,
};

const SKIP_VIEW_DURATION_MS = 2000;
const DEFUSE_VIEW_DURATION_MS = SKIP_VIEW_DURATION_MS;

const NOPE_BUTTON_POSITION = {
  x: 1700,
  y: 800,
};

// -------------------- MY HAND --------------------
const HAND_POSITION: Point = {
  x: SCREEN_WIDTH / 2,
  y: 940,
};

const getLastPlayedCard = (cards: Card[] | null) => {
  if (!cards || cards.length === 0) return null;

  return cards[cards.length - 1]!;
};

const LEAVE_BUTTON_SIZE = {
  width: 260,
  height: 72,
};

const LEAVE_BUTTON_POSITION: Point = {
  x: SCREEN_WIDTH - LEAVE_BUTTON_SIZE.width - 24,
  y: 24,
};

// -------------------- FAVOR --------------------

const FAVOR_CARD_DROP_ZONE = {
  x: HAND_POSITION.x - CARD_WIDTH / 2,
  y: PILES_Y,
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
};

// -------------------- NOTIFICATIONS --------------------
const NOTIFICATION_POSITION: Point = { x: SCREEN_WIDTH / 2, y: 870 };

// -------------------- GAME ROOM --------------------
export class GameRoom extends Scene implements GameRoomHandlers {
  #players: Map<string, PlayerSeat> = new Map();
  #opponents: Map<string, OpponentHand> = new Map();
  #myHand!: GraphicHand;
  #detachSockets: CleanupFunction | null = null;
  #meId: string | null = null;
  #currentTurnPlayerId: string | null = null;
  #drawPile: Phaser.GameObjects.Image | null = null;
  #drawPileZone: Phaser.GameObjects.Graphics | null = null;
  #shuffleAnimation!: ShuffleAnimation;
  #discardPile: Phaser.GameObjects.Image | null = null;
  #discardPileZone: Phaser.GameObjects.Graphics | null = null;
  #cardDropZone: Phaser.GameObjects.Zone | null = null;
  #selectedCardPlay: CardPlaySelection | null = null;
  #modal!: Modal;
  #attackCount = 1;
  #nopeButton!: NopeButton;
  #favorCardDropZone!: Phaser.GameObjects.Graphics;
  #favorModeActive: boolean = false;
  #isAlive = true;
  #notification!: Notification;
  #lastPlayedCardType: CardType | null = null;
  #insertingKittenNotificationTimeout: number | null = null;
  #drawPileSize = 0;
  #explodingKittenRiskBar: ExplodingKittenRiskBar | null = null;

  constructor() {
    super(Scenes.GameRoom);
  }

  // -------------------- INITIALIZATION --------------------

  create() {
    const gameData = getCachedGameState();

    if (!gameData) {
      throw new Error("Game room started without game data");
    }

    const { players, hand: cards, deckSize } = gameData;

    this.#drawPileSize = deckSize;

    this.#currentTurnPlayerId = gameData.currentTurnPlayerId;
    this.#attackCount = gameData.attackCount;

    addBackgroundImage(this, Textures.gameRoomBg);
    addFullscreenToggle(this);
    this.addLeaveGameButton();
    this.#nopeButton = new NopeButton(this, NOPE_BUTTON_POSITION);

    const graphicPlayers = this.createPlayers(players);
    this.setDeadPlayers(graphicPlayers);

    this.createOpponentHands(graphicPlayers);
    this.fillOpponentHands(players);
    this.fillSeats(graphicPlayers);
    players.forEach((player) => {
      this.#players.get(player.id)?.player?.setConnected(player.isConnected);
    });

    // Re-apply a turn that arrived before the scene existed
    if (this.#currentTurnPlayerId) {
      this.setCurrentTurn(this.#currentTurnPlayerId);
      this.updateAttackIndicator();
    }

    this.#isAlive = players[0]!.isAlive;

    this.createExplodingKittenRiskBar();
    this.createCardDropZone();
    this.createDrawPile();
    this.createDiscardPile(getLastPlayedCard(gameData.lastPlayedCards));
    this.createMyHand();
    this.fillMyHandWithCards(cards);
    if (!this.#isAlive) this.#myHand.disable();

    this.addShuffleAnimationObject();
    this.addModalWindowObject();
    this.createFavorCardDropZone();
    this.hideFavorUI();
    this.addNotificationObject();

    this.restoreUIState(gameData);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup);

    // Subscribe last: everything is initialized before cached socket events are handled.
    this.#detachSockets = attachGameRoomSockets(this);

    EventBus.emit("scene-ready", this);
  }

  private restoreUIState(gameData: GameStatePayload) {
    if (gameData.machineState) {
      const state = gameData.machineState;
      if (state === GameStates.SELECTING_PLAYER) {
        this.onWaitingForPlayerSelection();
      } else if (state === GameStates.WAITING_FOR_FAVOR_CARD_SELECTION) {
        this.onPlayerSelected({ playerId: gameData.selectedPlayerId! });
        this.onWaitingForFavorCardSelection({
          playerId: gameData.selectedPlayerId!,
        });
      } else if (state === GameStates.WAITING_FOR_DEFUSE_CARD) {
        if (this.isMyTurn()) {
          this.onDefusePrompt({
            endsAt: gameData.countdownEndsAt!,
            playerId: gameData.currentTurnPlayerId!,
            canDefuse: true,
          });
        } else {
          this.#notification.showMessageFor(NotificationMode.EXPLODING_KITTEN);
        }
      } else if (state === GameStates.PLAYER_LOOKS_AT_THE_FUTURE) {
        if (this.isMyTurn()) {
          this.onSeeTheFuturePeek({
            cards: gameData.topCards!,
            playerId: gameData.currentTurnPlayerId!,
          });
        } else {
          this.#notification.showMessageFor(NotificationMode.SEE_THE_FUTURE);
        }
      } else if (state === GameStates.WAITING_FOR_KITTEN_INSERTION) {
        if (this.isMyTurn()) {
          this.onPlayerDefused({
            playerId: gameData.currentTurnPlayerId!,
            deckSize: gameData.deckSize,
          });
        } else {
          this.#notification.showMessageFor(NotificationMode.INSERTING_KITTEN);
        }
      }
    }
  }

  private createExplodingKittenRiskBar() {
    this.#explodingKittenRiskBar = new ExplodingKittenRiskBar(
      this,
      CARDS_LEFT_LABEL,
      this.#players.size - 1,
      this.#drawPileSize,
    );
    this.add.existing(this.#explodingKittenRiskBar);
  }

  private createPlayers(players: Player[]) {
    return players.map((player) => {
      return new GraphicPlayer(this, { x: 0, y: 0 }, player, NAME_LABEL_CONFIG);
    });
  }

  private setDeadPlayers(players: GraphicPlayer[]) {
    players.forEach((player) => (player.isAlive ? player : player.setDead()));
  }

  private fillSeats(players: GraphicPlayer[]) {
    const me = players[0]!;
    this.#meId = me.id;
    const mySeat = new PlayerSeat(this, GAME_ROOM_SEATS[0]!);
    mySeat.addPlayer(me);
    this.#players.set(me.id, mySeat);

    for (let i = 1; i < players.length; ++i) {
      const opponent = players[i]!;
      const opponentSeat = new PlayerSeat(this, GAME_ROOM_SEATS[i]!);
      opponentSeat.addPlayer(opponent);

      if (opponent.isAlive)
        opponentSeat.addHand(this.#opponents.get(opponent.id)!);

      this.#players.set(opponent.id, opponentSeat);
    }

    const seats = [...this.#players.values()];
    if (seats.length === 2) {
      seats[1]?.moveTo(GAME_ROOM_SEATS[4]!);
    }
    if (players.length === 3) {
      seats[1]?.moveTo(GAME_ROOM_SEATS[2]!);
      seats[2]?.moveTo(GAME_ROOM_SEATS[4]!);
    }
    if (players.length === 4) {
      seats[1]?.moveTo(GAME_ROOM_SEATS[2]!);
      seats[2]?.moveTo(GAME_ROOM_SEATS[3]!);
      seats[3]?.moveTo(GAME_ROOM_SEATS[4]!);
    }
  }

  private isMyTurn = () => this.#meId === this.#currentTurnPlayerId;
  private isFavorModeActive = () => this.#favorModeActive;

  private giveCard = (cardId: number) => {
    giveCard(this.#meId!, this.#currentTurnPlayerId!, cardId);
  };

  private createMyHand() {
    const onCardDrop = (card: GraphicCard) => {
      if (this.#favorModeActive) {
        this.tweens.add({
          targets: card.image,
          x: FAVOR_CARD_DROP_ZONE.x,
          y: FAVOR_CARD_DROP_ZONE.y,
          displayWidth: CARD_WIDTH,
          displayHeight: CARD_HEIGHT,
          duration: 300,
          ease: "Back.Out",
          onComplete: () => {
            card.image.destroy();
            this.hideFavorUI();
          },
        });
      } else {
        // move it to the discard pile and shrink it down to pile size
        this.tweens.add({
          targets: card.image,
          x: DISCARD_PILE_POSITION.x,
          y: DISCARD_PILE_POSITION.y,
          displayWidth: CARD_WIDTH,
          displayHeight: CARD_HEIGHT,
          duration: CARD_TO_DISCARD_DURATION_MS,
          ease: CARD_TO_DISCARD_EASE,
          onComplete: () => this.setDiscardPile(card.image),
        });
      }
    };

    this.#myHand = new GraphicHand(
      this,
      HAND_POSITION,
      onCardDrop,
      this.isMyTurn,
      {
        onKindComboSelectionChange: this.emitKindComboSelectionChange,
        onKindComboPlay: this.playSelectedKindCombo,
      },
      this.isFavorModeActive,
      this.giveCard,
    );
  }

  private emitKindComboSelectionChange = (
    selection: CardPlaySelection | null,
  ) => {
    this.#selectedCardPlay = selection;
    this.updateComboPlayInteractivity();
    EventBus.emit("kind-combo-selection-change", selection);
  };

  private fillMyHandWithCards(cards: Card[]) {
    cards.forEach((card) => {
      const frameIndex = CARD_TYPE_TO_FRAME_INDEX[card.type];
      const frame = getCardFrame(this, frameIndex);
      this.#myHand.addCard(card, frame);
    });
  }

  private createOpponentHands(players: GraphicPlayer[]) {
    for (let i = 1; i < players.length; ++i) {
      if (!players[i]?.isAlive) continue;

      const x = OPPONENT_HAND_X_OFFSET;
      const y = OPPONENT_HAND_Y_OFFSET;

      const hand = new OpponentHand(this, { x, y });
      const opponent = players[i]!;
      this.#opponents.set(opponent.id, hand);
    }
  }

  private fillOpponentHands(players: PublicPlayerView[]) {
    for (let i = 1; i < players.length; ++i) {
      const player = players[i]!;
      this.#opponents.get(player.id)?.setCardCount(player.handSize);
    }
  }

  private updateDrawPileInteractivity() {
    if (this.isMyTurn()) {
      this.#drawPile?.setInteractive({ useHandCursor: true });
    } else {
      this.#drawPile?.disableInteractive(true);
    }
  }

  private createDrawPile() {
    const cardCover = this.textures.get(Textures.cardCover).get();
    this.#drawPile = this.addCard(cardCover, DRAW_PILE_POSITION);

    this.#drawPile.on("pointerdown", this.drawCard);
    this.updateDrawPileInteractivity();

    this.#drawPileZone = this.createPileZone(DRAW_PILE_POSITION);
    this.#drawPileZone.setVisible(false);
  }

  private createDiscardPile(lastPlayedCard: Card | null = null) {
    this.#discardPileZone = this.createPileZone(DISCARD_PILE_POSITION);

    if (lastPlayedCard) {
      const frame: Phaser.Textures.Frame = getCardFrame(
        this,
        CARD_TYPE_TO_FRAME_INDEX[lastPlayedCard.type],
      );

      this.setDiscardPile(this.addCard(frame, DISCARD_PILE_POSITION));
    }

    this.updateComboPlayInteractivity();
  }

  private createPileZone(position: Point) {
    const { x, y } = position;

    const outline = this.add.graphics();
    outline.lineStyle(4, 0xffffff, 1);
    outline.strokeRoundedRect(
      x,
      y,
      CARD_WIDTH,
      CARD_HEIGHT,
      CARD_BORDER_RADIUS,
    );

    return outline;
  }

  private createCardDropZone() {
    const { x, y, width, height } = CARD_DROP_ZONE;
    this.#cardDropZone = this.add.zone(x, y, width, height).setOrigin(0, 0);
    this.#cardDropZone.setRectangleDropZone(width, height);
    this.updateComboPlayInteractivity();
  }

  private addShuffleAnimationObject() {
    this.#shuffleAnimation = new ShuffleAnimation(
      this,
      SHUFFLE_ANIMATION_POSITION,
    );
  }

  private addModalWindowObject() {
    this.#modal = new Modal(this).setVisible(false);
  }

  private createFavorCardDropZone() {
    const { x, y, width, height } = FAVOR_CARD_DROP_ZONE;

    const outline = this.add.graphics();
    outline.lineStyle(4, 0xffffff, 1);
    outline.strokeRoundedRect(x, y, width, height, CARD_BORDER_RADIUS);

    this.#favorCardDropZone = outline;
  }

  private addNotificationObject() {
    this.#notification = new Notification(this, NOTIFICATION_POSITION);
    this.#notification.setVisible(false);
  }

  // -------------------- UTILS --------------------

  private addCard(frame: Phaser.Textures.Frame, position: Point) {
    const cardConfig = this.buildCardConfig(frame);
    const card = addCardVisual(this, position, cardConfig, CARD_BORDER_RADIUS);
    return card;
  }

  private addLeaveGameButton() {
    const button = new Button(
      this,
      LEAVE_BUTTON_POSITION,
      LEAVE_BUTTON_SIZE,
      "Leave game",
      this.leaveGame,
    );

    button.setBackgroundColor(0xc73535);
  }

  private leaveGame = () => {
    leaveCurrentGame();
  };

  onPlayerLeft = (payload: PlayerIdPayload) => {
    this.removePlayer(payload.playerId);
  };

  private removePlayer(playerId: string) {
    const player = this.#players.get(playerId);

    if (!player) return;

    this.#players.forEach((seat) => {
      if (seat.player?.id === playerId) seat.removePlayer();
    });

    this.#players.delete(playerId);
    this.removePLayerHand(playerId);
  }

  private removePLayerHand(playerId: string) {
    this.#opponents.get(playerId)?.container.setVisible(false);
    this.#opponents.delete(playerId);
  }

  setCurrentTurn(playerId: string) {
    this.#players.forEach((seat, id) => {
      seat.player?.setTurnActive(id === playerId);
    });
  }

  private getPlayerNameById(playerId: string) {
    return this.#players.get(playerId)?.player?.name;
  }

  private updateAttackIndicator() {
    this.#players.forEach((seat, playerId) => {
      const shouldShow =
        playerId === this.#currentTurnPlayerId && this.#attackCount > 1;

      if (shouldShow) {
        seat.attackIndicator.setTurnsCount(this.#attackCount);
      }

      seat.setAttackIndicatorVisible(shouldShow);
    });
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

  // -------------------- ACTIONS --------------------

  private showOpponentTargetIcons() {
    this.#drawPile?.disableInteractive(true);

    const players = [...this.#players.values()];
    for (let i = 1; i < players.length; ++i) {
      const player = players[i]!;
      if (player.player?.isAlive) {
        player.setTargetIconVisible(true);
        player.onClick = this.selectOpponent;
        player.setCursorPointer(true);
      }
    }
  }

  private selectOpponent = (playerId: string) => {
    const players = [...this.#players.values()];
    for (let i = 1; i < players.length; ++i) {
      const seat = players[i]!;
      seat.onClick = null;
      seat.setCursorPointer(false);
    }

    selectPlayer(playerId);
  };

  private hideFavorUI() {
    this.#favorModeActive = false;
    this.#favorCardDropZone.setVisible(false);
    this.#discardPileZone?.setVisible(true);
    this.#discardPile?.setVisible(true);
    this.#drawPile?.setVisible(true);
    this.#explodingKittenRiskBar?.setVisible(true);
  }

  private showFavorUI() {
    this.#favorModeActive = true;
    this.#favorCardDropZone.setVisible(true);
    this.#discardPileZone?.setVisible(false);
    this.#discardPile?.setVisible(false);
    this.#drawPile?.setVisible(false);
    this.#explodingKittenRiskBar?.setVisible(false);
  }

  private setDiscardPile(card: Phaser.GameObjects.Image) {
    if (this.#discardPile === card) return;

    this.#discardPile?.destroy();
    this.#discardPile = card;

    this.#discardPileZone?.setVisible(false);

    card.on("pointerdown", this.playSelectedKindCombo);
    this.updateComboPlayInteractivity();
  }

  // -------------------- SOCKETS --------------------

  onGameState = (payload: GameStatePayload): void => {
    this.#currentTurnPlayerId = payload.currentTurnPlayerId;
    this.#attackCount = payload.attackCount;
  };

  onCardReceived = (payload: CardPayload): void => {
    if (!this.#myHand) return;

    this.#myHand.clearKindComboSelection();

    // Generate random insert index
    const cardCount = this.#myHand.getCount();
    const insertIndex = Phaser.Math.Between(0, cardCount);

    // Get current card spacing and most left card position
    const { startX, spacing } = this.#myHand.getLayout();

    // Using that calculate where to insert the card
    let targetX;
    if (cardCount === 0) targetX = HAND_POSITION.x;
    else targetX = startX + spacing * insertIndex - spacing / 2;

    if (!this.#favorModeActive) {
      // Create face down card
      const cardCover = this.textures.get(Textures.cardCover).get();
      const faceDownCard = this.addCard(cardCover, DRAW_PILE_POSITION);

      // and move it below the screen
      // at the x position calculated earlier
      this.tweens.add({
        targets: faceDownCard,
        x: targetX,
        y: SCREEN_HEIGHT + CARD_HEIGHT / 2,
        duration: CARD_FROM_DRAW_PILE_DURATION_MS,
        ease: CARD_FROM_DRAW_PILE_EASE,

        onComplete: () => {
          // then destroy it
          faceDownCard.destroy();

          // and spawn the real card into player's hand
          const frameIndex = CARD_TYPE_TO_FRAME_INDEX[payload.card.type];
          const frame = getCardFrame(this, frameIndex);
          this.#myHand.addCard(payload.card, frame, insertIndex);
        },
      });
    } else {
      this.#notification.setVisible(false);
      this.#favorModeActive = false;
      this.updateDrawPileInteractivity();

      // spawn the card into player's hand
      const frameIndex = CARD_TYPE_TO_FRAME_INDEX[payload.card.type];
      const frame = getCardFrame(this, frameIndex);
      this.#myHand.addCard(payload.card, frame, insertIndex);
    }
  };

  private drawOpponentCard(playerId: string) {
    const hand = this.#opponents.get(playerId);

    if (!hand) return;

    const { position, size } = hand.getTopCardBounds();

    const cardCover = this.textures.get(Textures.cardCover).get();
    const flyingCard = this.addCard(cardCover, DRAW_PILE_POSITION);

    this.tweens.add({
      targets: flyingCard,
      x: position.x,
      y: position.y,
      displayWidth: size.width,
      displayHeight: size.height,
      duration: CARD_FROM_DRAW_PILE_DURATION_MS,
      ease: CARD_FROM_DRAW_PILE_EASE,

      onComplete: () => {
        flyingCard.destroy();
        hand.addCard();
      },
    });
  }

  private setDrawPileVisible(visible: boolean) {
    this.#drawPile?.setVisible(visible);
    this.#drawPileZone?.setVisible(!visible);
  }

  private revealDrawPile() {
    if (this.#drawPileSize > 0) this.setDrawPileVisible(true);
  }

  onCardDrawn = (payload: PlayerIdPayload): void => {
    this.drawOpponentCard(payload.playerId);

    this.#drawPileSize--;
    this.#explodingKittenRiskBar?.updateFrame(this.#drawPileSize);

    if (
      payload.playerId === this.#currentTurnPlayerId &&
      this.#attackCount > 1
    ) {
      this.#attackCount -= 1;
      this.updateAttackIndicator();
    }
    if (this.#drawPileSize === 0) {
      this.setDrawPileVisible(false);
    }
  };

  onTurnChanged = (payload: TurnChangedPayload) => {
    this.#currentTurnPlayerId = payload.playerId;
    this.#attackCount = payload.attackCount;

    this.setCurrentTurn(this.#currentTurnPlayerId);
    this.updateAttackIndicator();
    this.updateDrawPileInteractivity();
    this.updateComboPlayInteractivity();

    const playerName = this.getPlayerNameById(payload.playerId);
    this.#notification.showMessageFor(
      NotificationMode.TURN_CHANGED,
      playerName,
    );
    this.time.delayedCall(2000, () => this.#notification.setVisible(false));
  };

  private drawCard = () => {
    if (!this.isMyTurn()) return;
    drawCard();
  };

  private playSelectedKindCombo = () => {
    if (!this.isMyTurn() || !this.#selectedCardPlay) return;

    if (this.#selectedCardPlay.kind === "single-card") {
      playCard(this.#selectedCardPlay.cardId);
      return;
    }

    playCombo(this.#selectedCardPlay.cardIds);
  };

  private playNope = (cardId: number) => {
    this.#nopeButton.hide();
    playNope(cardId);
  };

  private updateComboPlayInteractivity() {
    const canPlaySelectedCards = this.isMyTurn() && this.#selectedCardPlay;

    if (canPlaySelectedCards) {
      this.#discardPile?.setInteractive({ useHandCursor: true });
      return;
    }

    this.#discardPile?.disableInteractive(true);
  }

  private startNopeWindow = (
    lastPlayerId: string,
    nopeWindowExpiresAt: number,
  ) => {
    const durationMs = nopeWindowExpiresAt - Date.now();

    if (durationMs <= 0) {
      this.#nopeButton.hide();
      return;
    }

    const myNopeCardId = this.#myHand.findCardIdByType(CardType.NOPE);

    if (
      !this.#isAlive ||
      lastPlayerId === this.#meId ||
      myNopeCardId === null
    ) {
      this.#nopeButton.showAnimated(durationMs, false);
      return;
    }

    this.#nopeButton.onClick = () => this.playNope(myNopeCardId);
    this.#nopeButton.showAnimated(durationMs, true);
  };

  private pulseDrawPile() {
    if (!this.#drawPile?.visible) return;

    const widthGrowth = CARD_WIDTH * (DRAW_PILE_PULSE_SCALE - 1);
    const heightGrowth = CARD_HEIGHT * (DRAW_PILE_PULSE_SCALE - 1);

    this.tweens.add({
      targets: this.#drawPile,
      x: DRAW_PILE_POSITION.x - widthGrowth / 2,
      y: DRAW_PILE_POSITION.y - heightGrowth / 2,
      displayWidth: CARD_WIDTH + widthGrowth,
      displayHeight: CARD_HEIGHT + heightGrowth,
      duration: DRAW_PILE_PULSE_DURATION_MS,
      ease: "Sine.easeInOut",
      yoyo: true,
    });
  }

  // Shrinking the width to zero and back reads as the card turning around
  // itself; swapping the visible face at every zero width turns it face down.
  private flipCard(
    flipper: Phaser.GameObjects.Container,
    face: Phaser.GameObjects.Image,
    back: Phaser.GameObjects.Image,
  ) {
    let isFaceUp = true;

    this.tweens.add({
      targets: flipper,
      scaleX: 0,
      duration: CARD_FLIP_HALF_TURN_DURATION_MS,
      ease: "Sine.easeIn",
      yoyo: true,
      repeat: CARD_FLIP_HALF_TURNS - 1,

      onYoyo: () => {
        isFaceUp = !isFaceUp;
        face.setVisible(isFaceUp);
        back.setVisible(!isFaceUp);
      },
    });
  }

  private animateCardToDrawPile(card: Phaser.GameObjects.Image) {
    this.tweens.killTweensOf(card);

    const { displayWidth: width, displayHeight: height } = card;
    const center: Point = {
      x: card.x + width / 2,
      y: card.y + height / 2,
    };

    const cardCover = this.textures.get(Textures.cardCover).get();
    const back = addCardVisual(
      this,
      { x: 0, y: 0 },
      { frame: cardCover, size: { width, height } },
      CARD_BORDER_RADIUS,
    ).setVisible(false);

    // Centered origins keep the card turning around itself instead of its corner
    [card, back].forEach((image) =>
      image.setOrigin(0.5, 0.5).setPosition(0, 0),
    );

    // The inner container spins, the outer one flies: no tween fights over scale
    const flipper = this.add.container(0, 0, [card, back]);
    const flyingCard = this.add
      .container(center.x, center.y, [flipper])
      .setDepth(FLYING_CARD_DEPTH);

    this.flipCard(flipper, card, back);

    this.tweens.add({
      targets: flyingCard,
      x: DRAW_PILE_POSITION.x + CARD_WIDTH / 2,
      y: DRAW_PILE_POSITION.y + CARD_HEIGHT / 2,
      scale: CARD_WIDTH / width,
      duration: CARD_TO_DRAW_PILE_DURATION_MS,
      ease: CARD_TO_DRAW_PILE_EASE,

      onComplete: () => {
        flyingCard.destroy();
        this.revealDrawPile();
        this.pulseDrawPile();
      },
    });
  }

  onCardRemoved = (payload: CardRemovedPayload): void => {
    const card = this.#myHand.removeCard(payload.cardId, payload.reason);
    if (payload.reason === CardRemovalReason.INSERTED_INTO_DECK)
      this.animateCardToDrawPile(card.image);

    if (this.isMyTurn() && card.data.type !== CardType.DEFUSE)
      this.#notification.showMessageFor(NotificationMode.WAITING_FOR_NOPES);
  };

  private discardOpponentCard(playerId: string, cardType: CardType) {
    const frameIndex = CARD_TYPE_TO_FRAME_INDEX[cardType];
    const cardFrame = getCardFrame(this, frameIndex);
    const hand = this.#opponents.get(playerId);

    if (!hand) {
      this.setDiscardPile(this.addCard(cardFrame, DISCARD_PILE_POSITION));
      return;
    }

    const { position, size } = hand.getTopCardBounds();
    hand.removeCard();

    const flyingCard = this.addCard(cardFrame, position);
    flyingCard.setDisplaySize(size.width, size.height);

    this.tweens.add({
      targets: flyingCard,
      x: DISCARD_PILE_POSITION.x,
      y: DISCARD_PILE_POSITION.y,
      displayWidth: CARD_WIDTH,
      displayHeight: CARD_HEIGHT,
      duration: CARD_TO_DISCARD_DURATION_MS,
      ease: CARD_TO_DISCARD_EASE,
      onComplete: () => this.setDiscardPile(flyingCard),
    });
  }

  onCardPlayed = (payload: CardPlayedPayload): void => {
    this.discardOpponentCard(payload.playerId, payload.cardType);
    this.startNopeWindow(payload.playerId, payload.nopeWindowExpiresAt);
    this.#drawPile?.disableInteractive(true);

    this.#lastPlayedCardType = payload.cardType;
  };

  onNopePlayed = (payload: NopePlayedPayload): void => {
    this.discardOpponentCard(payload.playerId, CardType.NOPE);
    this.startNopeWindow(payload.playerId, payload.nopeWindowExpiresAt);
  };

  onNopeWindowResolved = (): void => {
    this.#notification.setVisible(false);
    this.#nopeButton.hide();
    this.updateDrawPileInteractivity();

    if (this.#lastPlayedCardType === CardType.SEE_THE_FUTURE) {
      const playerName = this.getPlayerNameById(this.#currentTurnPlayerId!);
      this.#notification.showMessageFor(
        NotificationMode.SEE_THE_FUTURE,
        playerName,
      );
    }

    this.#lastPlayedCardType = null;
  };

  onTurnSkipped = (payload: TurnSkippedPayload): void => {
    this.#attackCount = payload.attackCount;
    this.updateAttackIndicator();
    const playerName = this.#players.get(payload.playerId)?.player?.name;
    if (!playerName) return;

    const modal = new Modal(this);
    const view = new SkipView(this, playerName);
    modal.setContent(view);

    this.time.delayedCall(SKIP_VIEW_DURATION_MS, () => modal.destroy());
  };

  onDefusePrompt = (payload: DefusePromptPayload): void => {
    this.cleanModal();
    const view = new ExplodingKittenDrawnView(
      this,
      payload.endsAt,
      payload.canDefuse,
    );
    this.#modal!.setContent(view);
    this.#modal!.setVisible(true);
    view.onDefuse = () => playDefuse();
  };

  onPlayerDefused = (payload: PlayerDefusedPayload): void => {
    if (payload.playerId === this.#meId) {
      this.cleanModal();

      const view = new ExplodingKittenInsertionView(this, payload.deckSize);
      this.time.delayedCall(500, () => {
        this.#modal!.setContent(view);
        this.#modal!.setVisible(true);
      });
      view.onConfirm = (explodingKittenPosition: number) => {
        this.cleanModal();
        insertKitten(explodingKittenPosition);
      };
    } else {
      if (!this.isMyTurn()) {
        this.#notification.setVisible(false);
        this.#insertingKittenNotificationTimeout = setTimeout(() => {
          const playerName = this.getPlayerNameById(this.#currentTurnPlayerId!);
          this.#notification.showMessageFor(
            NotificationMode.INSERTING_KITTEN,
            playerName,
          );
        }, DEFUSE_VIEW_DURATION_MS);
      }

      const playerName = this.#players.get(payload.playerId)?.player?.name;
      if (!playerName) return;
      const defuseView = new DefuseView(this, playerName);
      this.#modal.setContent(defuseView);
      this.#modal.setVisible(true);
      const modal = this.#modal;
      this.time.delayedCall(DEFUSE_VIEW_DURATION_MS, () =>
        modal.setVisible(false),
      );
    }
  };

  onKittenInserted = (payload: KittenInsertedPayload): void => {
    if (this.#insertingKittenNotificationTimeout) {
      clearTimeout(this.#insertingKittenNotificationTimeout);
      this.#insertingKittenNotificationTimeout = null;
    }
    this.#notification.setVisible(false);

    const { playerId } = payload;

    this.#drawPileSize++;
    this.#explodingKittenRiskBar?.updateFrame(this.#drawPileSize);

    // My own insertion is animated out of my hand by the card removal
    const hand = this.#opponents.get(playerId);
    if (!hand) return;

    const { position, size } = hand.getTopCardBounds();

    const cardCover = this.textures.get(Textures.cardCover).get();
    const cardConfig: CardConfig = {
      frame: cardCover,
      size,
    };
    const flyingCard = addCardVisual(
      this,
      position,
      cardConfig,
      CARD_BORDER_RADIUS,
    );

    this.tweens.add({
      targets: flyingCard,
      x: DRAW_PILE_POSITION.x,
      y: DRAW_PILE_POSITION.y,
      displayWidth: CARD_WIDTH,
      displayHeight: CARD_HEIGHT,
      duration: CARD_FROM_DRAW_PILE_DURATION_MS,
      ease: CARD_FROM_DRAW_PILE_EASE,

      onComplete: () => {
        flyingCard.destroy();
        hand.removeCard();
        this.revealDrawPile();
      },
    });
  };

  onPlayerEliminated = (payload: PlayerIdPayload): void => {
    this.#notification.setVisible(false);

    if (payload.playerId === this.#meId) {
      this.#isAlive = false;
      this.cleanModal();
      this.#myHand.disable();
      this.#nopeButton.hide();
      this.#drawPile?.disableInteractive(true);
      this.#discardPile?.disableInteractive(true);
    }
    this.#players.get(payload.playerId)?.explodePlayer(this);
  };

  onKittenDrawn = (): void => {
    if (this.#meId !== this.#currentTurnPlayerId) {
      const playerName = this.getPlayerNameById(this.#currentTurnPlayerId!);
      this.#notification.showMessageFor(
        NotificationMode.EXPLODING_KITTEN,
        playerName,
      );
    }
  };

  onGameOver = (payload: GameOverPayload): void => {
    console.log(`Game over, winner is ${payload.winner.name}`);
    this.time.delayedCall(5000, () => {
      this.scene.start(Scenes.GameOverRoom, payload);
    });
  };

  private cleanModal() {
    this.#modal?.setVisible(false);
  }

  onPlayerDisconnected = (payload: PlayerIdPayload): void => {
    this.#players.get(payload.playerId)?.player?.setConnected(false);
  };

  onPlayerReconnected = (payload: PlayerIdPayload): void => {
    this.#players.get(payload.playerId)?.player?.setConnected(true);
  };

  onDeckShuffled = (): void => {
    this.#shuffleAnimation.playAnimation();
  };

  onComboPlayed = (payload: ComboPlayedPayload): void => {
    payload.cardTypes.forEach((cardType) => {
      this.discardOpponentCard(payload.playerId, cardType);
    });

    this.startNopeWindow(payload.playerId, payload.nopeWindowExpiresAt);
    this.#drawPile?.disableInteractive(true);
  };

  onSeeTheFuturePeek = (payload: SeeTheFuturePeekPayload): void => {
    const threeCards = payload.cards;
    const view = new SeeTheFutureView(this, threeCards);
    view.onConfirm = () => {
      this.#modal.setVisible(false);
      seenTheFuture();
    };

    this.#modal.setContent(view);
    this.#modal.setVisible(true);
  };

  onPlayerSelected = (payload: PlayerSelectedPayload): void => {
    this.#notification.setVisible(false);

    const { playerId } = payload;

    const players = [...this.#players.values()];
    for (let i = 0; i < players.length; ++i) {
      const seat = players[i]!;
      seat.onClick = null;
      seat.setCursorPointer(false);
      if (seat.player?.id !== playerId) players[i]?.setTargetIconVisible(false);
      else players[i]?.setTargetIconVisible(true);
    }
  };

  onCardGiven = (payload: CardGivenPayload): void => {
    this.#notification.setVisible(false);

    const players = [...this.#players.values()];
    for (let i = 0; i < players.length; ++i) {
      const seat = players[i]!;
      seat.setTargetIconVisible(false);
    }

    const { playerIdFrom, playerIdTo } = payload;

    if (this.#meId === playerIdFrom) {
      this.#opponents.get(playerIdTo)?.addCard();
    } else if (this.#meId === playerIdTo) {
      this.#opponents.get(playerIdFrom)?.removeCard();
    } else {
      this.#opponents.get(playerIdFrom)?.removeCard();
      this.#opponents.get(playerIdTo)?.addCard();
    }
  };

  onWaitingForPlayerSelection = () => {
    if (this.isMyTurn()) {
      this.showOpponentTargetIcons();
      this.#notification.showMessageFor(NotificationMode.SELECT_PLAYER);
    } else {
      const playerName = this.getPlayerNameById(this.#currentTurnPlayerId!);
      this.#notification.showMessageFor(
        NotificationMode.WAITING_FOR_PLAYER_SELECTION,
        playerName,
      );
    }
  };

  onWaitingForFavorCardSelection = (
    payload: WaitingForFavorCardSelectionPayload,
  ) => {
    if (this.#meId === payload.playerId) {
      this.showFavorUI();
      this.#notification.showMessageFor(NotificationMode.SELECT_CARD);
    } else {
      const playerName = this.getPlayerNameById(payload.playerId);
      this.#notification.showMessageFor(
        NotificationMode.WAITING_FOR_CARD_SELECTION,
        playerName,
      );

      if (this.isMyTurn()) {
        this.#favorModeActive = true;
      }
    }
  };

  onPlayerSawTheFuture = (): void => {
    this.#notification.setVisible(false);
  };

  private cleanup = () => {
    this.#detachSockets?.();
    this.#detachSockets = null;

    // Remove whichever event didn't fire
    this.events.off(Phaser.Scenes.Events.SHUTDOWN, this.cleanup);
    this.events.off(Phaser.Scenes.Events.DESTROY, this.cleanup);
  };
}
