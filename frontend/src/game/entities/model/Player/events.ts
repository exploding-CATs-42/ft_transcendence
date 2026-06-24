import type { Card } from "@exploding-cats/game-core";

// Events sent TO the machine
export const PlayerEvents = {
  CONFIRM_READINESS: "CONFIRM_READINESS",
  CANCEL_READINESS: "CANCEL_READINESS",
  GAME_STARTED: "GAME_STARTED",
  PLAY_CARD: "PLAY_CARD",
  DRAW_CARD: "DRAW_CARD",
  TAKE_CARD: "TAKE_CARD",
  GIVE_CARD: "GIVE_CARD",
  GIVE_ANY_CARD: "GIVE_ANY_CARD",
  GET_ATTACKED: "GET_ATTACKED",
  EXPLODE: "EXPLODE",
  TURN_COUNT_CHANGED: "TURN_COUNT_CHANGED",
  TURN_CHANGED: "TURN_CHANGED",
  START_TURN: "START_TURN",
  END_TURN: "END_TURN",
  GAME_ENDED: "GAME_ENDED",
} as const;

export type PlayerEvents = (typeof PlayerEvents)[keyof typeof PlayerEvents];

export type PlayerEvent =
  | { type: typeof PlayerEvents.CONFIRM_READINESS; playerId: string }
  | { type: typeof PlayerEvents.CANCEL_READINESS; playerId: string }
  | { type: typeof PlayerEvents.GAME_STARTED }
  | { type: typeof PlayerEvents.PLAY_CARD; card: Card }
  | { type: typeof PlayerEvents.TAKE_CARD; card: Card }
  | { type: typeof PlayerEvents.DRAW_CARD; card: Card }
  | { type: typeof PlayerEvents.GIVE_CARD; card: Card }
  | { type: typeof PlayerEvents.GIVE_ANY_CARD; card: Card }
  | { type: typeof PlayerEvents.GET_ATTACKED; additionalTurnsCount: number }
  | { type: typeof PlayerEvents.EXPLODE }
  | { type: typeof PlayerEvents.TURN_COUNT_CHANGED }
  | { type: typeof PlayerEvents.TURN_CHANGED }
  | { type: typeof PlayerEvents.START_TURN }
  | { type: typeof PlayerEvents.END_TURN }
  | { type: typeof PlayerEvents.GAME_ENDED };

// Events emitted FROM the machine
export const PlayerOutEvents = {
  READINESS_CONFIRMED: "READINESS_CONFIRMED",
  READINESS_CANCELED: "READINESS_CANCELED",
  CARD_PLAYED: "CARD_PLAYED",
  CARD_DRAWN: "CARD_DRAWN",
  CARD_TAKEN: "CARD_TAKEN",
  CARD_GIVEN: "CARD_GIVEN",
  SOME_CARD_GIVEN: "SOME_CARD_GIVEN",
  GOT_ATTACKED: "GOT_ATTACKED",
  EXPLODED: "EXPLODED",
} as const;

export type PlayerOutEvents =
  (typeof PlayerOutEvents)[keyof typeof PlayerOutEvents];

export type PlayerOutEvent =
  | { type: typeof PlayerOutEvents.READINESS_CONFIRMED; playerId: string }
  | { type: typeof PlayerOutEvents.READINESS_CANCELED; playerId: string }
  | { type: typeof PlayerOutEvents.CARD_PLAYED; card: Card }
  | { type: typeof PlayerOutEvents.CARD_DRAWN; card: Card }
  | { type: typeof PlayerOutEvents.CARD_TAKEN; card: Card }
  | { type: typeof PlayerOutEvents.CARD_GIVEN; card: Card }
  | { type: typeof PlayerOutEvents.SOME_CARD_GIVEN; card: Card }
  | { type: typeof PlayerOutEvents.GOT_ATTACKED; turnsCount: number }
  | { type: typeof PlayerOutEvents.EXPLODED };
