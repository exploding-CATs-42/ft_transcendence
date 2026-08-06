import type { Card, Player } from "./types";
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
  WaitingForFavorCardSelectionPayload,
  PlayerSawTheFuturePayload,
  ComboSelectionRequestedPayload,
  ExplodingKittenDrawnPayload,
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
  SELECT_PLAYER: "SELECT_PLAYER",
  PASS_CARD_BY_ID: "PASS_CARD_BY_ID",
  SEEN_THE_FUTURE: "SEEN_THE_FUTURE",
  RESOLVE_COMBO: "RESOLVE_COMBO",
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
      type: typeof GameEvents.PASS_CARD_BY_ID;
      cardId: number;
      playerIdFrom: string;
      playerIdTo: string;
    }
  | {
      type: typeof GameEvents.SEEN_THE_FUTURE;
    }
  | {
      type: typeof GameEvents.RESOLVE_COMBO;
      playerId: Player["id"];
      targetPlayerId: Player["id"];
      cardIndex?: number;
      requestedCardType?: Card["type"];
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
  WAITING_FOR_FAVOR_CARD_SELECTION: "WAITING_FOR_FAVOR_CARD_SELECTION",
  PLAYER_SAW_THE_FUTURE: "PLAYER_SAW_THE_FUTURE",
  COMBO_SELECTION_REQUESTED: "COMBO_SELECTION_REQUESTED",

  //   COMBO_PLAYED: "COMBO_PLAYED",
  //   NOPE_PLAYED: "NOPE_PLAYED",
  //   PLAYER_DEFUSED: "PLAYER_DEFUSED",
  //   KITTEN_INSERTED: "KITTEN_INSERTED",
  //   FAVOR_REQUESTED: "FAVOR_REQUESTED",
  //   FAVOR_RESOLVED: "FAVOR_RESOLVED",
  //   DECK_SHUFFLED: "DECK_SHUFFLED",
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
      type: typeof GameOutEvents.COMBO_SELECTION_REQUESTED;
      payload: ComboSelectionRequestedPayload;
    }
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
      type: typeof GameOutEvents.WAITING_FOR_FAVOR_CARD_SELECTION;
      payload: WaitingForFavorCardSelectionPayload;
    }
  | {
      type: typeof GameOutEvents.PLAYER_SAW_THE_FUTURE;
      payload: PlayerSawTheFuturePayload;
    };
