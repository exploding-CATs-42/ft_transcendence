// Events sent TO the machine
export const PlayerEvents = {
  EXPLODE: "EXPLODE",
} as const;

export type PlayerEvents =
  (typeof PlayerEvents)[keyof typeof PlayerEvents];

export type PlayerEvent = { type: typeof PlayerEvents.EXPLODE };

// Events emitted FROM the machine
export const PlayerOutEvents = {
  EXPLODED: "EXPLODED",
} as const;

export type PlayerOutEvents =
  (typeof PlayerOutEvents)[keyof typeof PlayerOutEvents];

export type PlayerOutEvent = { type: typeof PlayerOutEvents.EXPLODED };
