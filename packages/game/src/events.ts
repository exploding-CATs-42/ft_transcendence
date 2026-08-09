import type { Card, CardType, Player } from "./types";
import type {
  ShowedCardsToPlayerPayload,
  TurnChangedPayload,
  TurnSkippedPayload,
  DefusePromptPayload,
  PlayerDefusedPayload,
  KittenInsertedPayload,
  PlayerEliminatedPayload,
  GameOverPayload,
  PlayerSelectedPayload,
  WaitingForCardIdSelectionPayload,
  PlayerSawTheFuturePayload,
  ExplodingKittenDrawnPayload,
  WaitingForCardIndexSelectionPayload,
  WaitingForCardTypeSelectionPayload,
  CardGivenPayload,
  NoCardOfRequestedTypePayload,
} from "./eventPayloads";

// Events sent TO the machine
export const GameEvents = {
  JOIN_GAME: "JOIN_GAME",
  LEAVE_GAME: "LEAVE_GAME",
  CONFIRM_START: "CONFIRM_START",
  CANCEL_START: "CANCEL_START",
  DRAW_CARD: "DRAW_CARD",
  PLAY_CARD: "PLAY_CARD",
  PLAY_COMBO: "PLAY_COMBO",
  PLAY_DEFUSE: "PLAY_DEFUSE",
  INSERT_KITTEN: "INSERT_KITTEN",
  PLAY_NOPE: "PLAY_NOPE",
  SEEN_THE_FUTURE: "SEEN_THE_FUTURE",
  SELECT_PLAYER: "SELECT_PLAYER",
  CHOOSE_CARD_ID: "CHOOSE_CARD_ID",
  CHOOSE_CARD_INDEX: "CHOOSE_CARD_INDEX",
  CHOOSE_CARD_TYPE: "CHOOSE_CARD_TYPE",
} as const;

export type GameEvents = (typeof GameEvents)[keyof typeof GameEvents];

export type GameEvent =
  | { type: typeof GameEvents.JOIN_GAME; player: Player }
  | { type: typeof GameEvents.LEAVE_GAME; playerId: Player["id"] }
  | { type: typeof GameEvents.CONFIRM_START; playerId: Player["id"] }
  | { type: typeof GameEvents.CANCEL_START; playerId: Player["id"] }
  | { type: typeof GameEvents.DRAW_CARD; playerId: Player["id"] }
  | {
      type: typeof GameEvents.PLAY_CARD;
      playerId: Player["id"];
      card: Card;
    }
  | {
      type: typeof GameEvents.PLAY_COMBO;
      playerId: Player["id"];
      cardIds: number[];
    }
  | {
      type: typeof GameEvents.PLAY_DEFUSE;
      playerId: Player["id"];
    }
  | {
      type: typeof GameEvents.INSERT_KITTEN;
      explodingKittenPosition: number;
    }
  | {
      type: typeof GameEvents.PLAY_NOPE;
      playerId: Player["id"];
      card: Card;
    }
  | { type: typeof GameEvents.SELECT_PLAYER; playerId: Player["id"] }
  | {
      type: typeof GameEvents.CHOOSE_CARD_ID;
      cardId: number;
    }
  | {
      type: typeof GameEvents.SEEN_THE_FUTURE;
    }
  | {
      type: typeof GameEvents.CHOOSE_CARD_INDEX;
      cardIndex: number;
    }
  | {
      type: typeof GameEvents.CHOOSE_CARD_TYPE;
      cardType: CardType;
    };

// Events emitted FROM the machine
export const GameOutEvents = {
  GAME_STARTED: "GAME_STARTED",
  COUNTDOWN_STARTED: "COUNTDOWN_STARTED",
  COUNTDOWN_CANCELED: "COUNTDOWN_CANCELED",
  CARDS_DEALT: "CARDS_DEALT",
  TURN_CHANGED: "TURN_CHANGED",
  DECK_SHUFFLED: "DECK_SHUFFLED",
  TURN_SKIPPED: "TURN_SKIPPED",
  SHOWED_TOP_CARDS: "SHOWED_TOP_CARDS",
  EXPLODING_KITTEN_DRAWN: "EXPLODING_KITTEN_DRAWN",
  PLAYER_DEFUSED: "PLAYER_DEFUSED",
  DEFUSE_PROMPT: "DEFUSE_PROMPT",
  KITTEN_INSERTED: "KITTEN_INSERTED",
  PLAYER_ELIMINATED: "PLAYER_ELIMINATED",
  GAME_OVER: "GAME_OVER",
  NOPE_WINDOW_RESOLVED: "NOPE_WINDOW_RESOLVED",
  PLAYER_SELECTED: "PLAYER_SELECTED",
  WAITING_FOR_PLAYER_SELECTION: "WAITING_FOR_PLAYER_SELECTION",
  PLAYER_SAW_THE_FUTURE: "PLAYER_SAW_THE_FUTURE",
  WAITING_FOR_CARD_ID_SELECTION: "WAITING_FOR_CARD_ID_SELECTION",
  WAITING_FOR_CARD_INDEX_SELECTION: "WAITING_FOR_CARD_INDEX_SELECTION",
  WAITING_FOR_CARD_TYPE_SELECTION: "WAITING_FOR_CARD_TYPE_SELECTION",
  CARD_GIVEN: "CARD_GIVEN",
  NO_CARD_OF_REQUESTED_TYPE: "NO_CARD_OF_REQUESTED_TYPE",
} as const;

export type GameOutEvents = (typeof GameOutEvents)[keyof typeof GameOutEvents];

export type GameOutEvent =
  | {
      type: typeof GameOutEvents.GAME_STARTED;
      players: Player[];
      deckSize: number;
      kittensInDeck: number;
    }
  | { type: typeof GameOutEvents.COUNTDOWN_STARTED; endsAt: number }
  | { type: typeof GameOutEvents.COUNTDOWN_CANCELED }
  | { type: typeof GameOutEvents.TURN_CHANGED; payload: TurnChangedPayload }
  | { type: typeof GameOutEvents.DECK_SHUFFLED }
  | { type: typeof GameOutEvents.TURN_SKIPPED; payload: TurnSkippedPayload }
  | { type: typeof GameOutEvents.NOPE_WINDOW_RESOLVED }
  | {
      type: typeof GameOutEvents.SHOWED_TOP_CARDS;
      payload: ShowedCardsToPlayerPayload;
    }
  | {
      type: typeof GameOutEvents.EXPLODING_KITTEN_DRAWN;
      payload: ExplodingKittenDrawnPayload;
    }
  | {
      type: typeof GameOutEvents.PLAYER_ELIMINATED;
      payload: PlayerEliminatedPayload;
    }
  | {
      type: typeof GameOutEvents.PLAYER_DEFUSED;
      payload: PlayerDefusedPayload;
    }
  | {
      type: typeof GameOutEvents.DEFUSE_PROMPT;
      payload: DefusePromptPayload;
    }
  | {
      type: typeof GameOutEvents.KITTEN_INSERTED;
      payload: KittenInsertedPayload;
    }
  | {
      type: typeof GameOutEvents.GAME_OVER;
      payload: GameOverPayload;
    }
  | {
      type: typeof GameOutEvents.PLAYER_SELECTED;
      payload: PlayerSelectedPayload;
    }
  | {
      type: typeof GameOutEvents.WAITING_FOR_PLAYER_SELECTION;
    }
  | {
      type: typeof GameOutEvents.PLAYER_SAW_THE_FUTURE;
      payload: PlayerSawTheFuturePayload;
    }
  | {
      type: typeof GameOutEvents.WAITING_FOR_CARD_ID_SELECTION;
      payload: WaitingForCardIdSelectionPayload;
    }
  | {
      type: typeof GameOutEvents.WAITING_FOR_CARD_INDEX_SELECTION;
      payload: WaitingForCardIndexSelectionPayload;
    }
  | {
      type: typeof GameOutEvents.WAITING_FOR_CARD_TYPE_SELECTION;
      payload: WaitingForCardTypeSelectionPayload;
    }
  | {
      type: typeof GameOutEvents.CARD_GIVEN;
      payload: CardGivenPayload;
    }
  | {
      type: typeof GameOutEvents.NO_CARD_OF_REQUESTED_TYPE;
      payload: NoCardOfRequestedTypePayload;
    };
