import type { Card, Player } from "./types";
import type { TurnChangedPayload } from "./eventPayloads";

// Events sent TO the machine
export const GameEvents = {
  JOIN_GAME: "JOIN_GAME",
  LEAVE_GAME: "LEAVE_GAME",
  CONFIRM_START: "CONFIRM_START",
  CANCEL_START: "CANCEL_START",
  DRAW_CARD: "DRAW_CARD",
  PLAY_CARD: "PLAY_CARD",
  PLAY_COMBO: "PLAY_COMBO",
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
    };

// Events emitted FROM the machine
export const GameOutEvents = {
  GAME_STARTED: "GAME_STARTED",
  COUNTDOWN_STARTED: "COUNTDOWN_STARTED",
  COUNTDOWN_CANCELED: "COUNTDOWN_CANCELED",
  CARDS_DEALT: "CARDS_DEALT",
  TURN_CHANGED: "TURN_CHANGED",

  //   EXPLODING_KITTEN_DRAWN: "EXPLODING_KITTEN_DRAWN",
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
    }
  | { type: typeof GameOutEvents.COUNTDOWN_STARTED; endsAt: number }
  | { type: typeof GameOutEvents.COUNTDOWN_CANCELED }
  | { type: typeof GameOutEvents.TURN_CHANGED; payload: TurnChangedPayload };
