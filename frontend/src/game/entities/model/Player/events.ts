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
