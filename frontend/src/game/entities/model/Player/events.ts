import type { Card } from "@exploding-cats/game-core";

// Events sent TO the machine
export const PlayerEvents = {
  CONFIRM_READINESS: "CONFIRM_READINESS",
  CANCEL_READINESS: "CANCEL_READINESS",
  GAME_STARTED: "GAME_STARTED",
  GAME_ENDED: "GAME_ENDED",
  EXPLODE: "EXPLODE",
  GIVE_CARD: "GIVE_CARD",
  GIVE_ANY_CARD: "GIVE_ANY_CARD",
  START_TURN: "START_TURN",
  DRAW_CARD: "DRAW_CARD",
  TAKE_CARD: "TAKE_CARD",
  END_TURN: "END_TURN",
} as const;

export type PlayerEvents = (typeof PlayerEvents)[keyof typeof PlayerEvents];

export type PlayerEvent =
  | { type: typeof PlayerEvents.CONFIRM_READINESS; playerId: string }
  | { type: typeof PlayerEvents.CANCEL_READINESS; playerId: string }
  | { type: typeof PlayerEvents.GAME_STARTED }
  | { type: typeof PlayerEvents.GAME_ENDED }
  | { type: typeof PlayerEvents.TAKE_CARD; card: Card }
  | { type: typeof PlayerEvents.DRAW_CARD; card: Card }
  | { type: typeof PlayerEvents.EXPLODE }
  | { type: typeof PlayerEvents.END_TURN };

// Events emitted FROM the machine
export const PlayerOutEvents = {
  READINESS_CONFIRMED: "READINESS_CONFIRMED",
  READINESS_CANCELED: "READINESS_CANCELED",
  EXPLODED: "EXPLODED",
  CARD_DRAWN: "CARD_DRAWN",
  CARD_TAKEN: "CARD_TAKEN",
} as const;

export type PlayerOutEvents =
  (typeof PlayerOutEvents)[keyof typeof PlayerOutEvents];

export type PlayerOutEvent =
  | { type: typeof PlayerOutEvents.READINESS_CONFIRMED; playerId: string }
  | { type: typeof PlayerOutEvents.READINESS_CANCELED; playerId: string }
  | { type: typeof PlayerOutEvents.EXPLODED }
  | { type: typeof PlayerOutEvents.CARD_DRAWN; card: Card }
  | { type: typeof PlayerOutEvents.CARD_TAKEN; card: Card };
