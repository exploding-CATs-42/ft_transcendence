import type { Card } from "@exploding-cats/game-core";

// Events sent TO the machine
export const PlayerEvents = {
  EXPLODE: "EXPLODE",
  PLAY_CARD: "PLAY_CARD",
} as const;

export type PlayerEvents = (typeof PlayerEvents)[keyof typeof PlayerEvents];

export type PlayerEvent =
  | { type: typeof PlayerEvents.EXPLODE }
  | { type: typeof PlayerEvents.PLAY_CARD; card: Card };

// Events emitted FROM the machine
export const PlayerOutEvents = {
  EXPLODED: "EXPLODED",
} as const;

export type PlayerOutEvents =
  (typeof PlayerOutEvents)[keyof typeof PlayerOutEvents];

export type PlayerOutEvent = { type: typeof PlayerOutEvents.EXPLODED };
