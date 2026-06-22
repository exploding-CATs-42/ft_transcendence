// Events sent TO the machine
export const OpponentEvents = {
  EXPLODE: "EXPLODE",
} as const;

export type OpponentEvents =
  (typeof OpponentEvents)[keyof typeof OpponentEvents];

export type OpponentEvent = { type: typeof OpponentEvents.EXPLODE };

// Events emitted FROM the machine
export const OpponentOutEvents = {
  EXPLODED: "EXPLODED",
} as const;

export type OpponentOutEvents =
  (typeof OpponentOutEvents)[keyof typeof OpponentOutEvents];

export type OpponentOutEvent = { type: typeof OpponentOutEvents.EXPLODED };
