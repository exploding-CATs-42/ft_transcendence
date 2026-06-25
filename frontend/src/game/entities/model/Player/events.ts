import type { Card } from "@exploding-cats/game-core";

// Events sent TO the machine
export const PlayerEvents = {
  DRAW_CARD: "DRAW_CARD",
  TAKE_CARD: "TAKE_CARD",
} as const;

export type PlayerEvents = (typeof PlayerEvents)[keyof typeof PlayerEvents];

export type PlayerEvent =
  | { type: typeof PlayerEvents.TAKE_CARD; card: Card }
  | { type: typeof PlayerEvents.DRAW_CARD; card: Card };

// Events emitted FROM the machine
export const PlayerOutEvents = {
  CARD_DRAWN: "CARD_DRAWN",
  CARD_TAKEN: "CARD_TAKEN",
} as const;

export type PlayerOutEvents =
  (typeof PlayerOutEvents)[keyof typeof PlayerOutEvents];

export type PlayerOutEvent =
  | { type: typeof PlayerOutEvents.CARD_DRAWN; card: Card }
  | { type: typeof PlayerOutEvents.CARD_TAKEN; card: Card };
