// Events sent TO the machine
export const MyEvents = {
  EXPLODE: "EXPLODE",
} as const;

export type MyEvents =
  (typeof MyEvents)[keyof typeof MyEvents];

export type MyEvent = { type: typeof MyEvents.EXPLODE };

// Events emitted FROM the machine
export const MyOutEvents = {
  EXPLODED: "EXPLODED",
} as const;

export type MyOutEvents =
  (typeof MyOutEvents)[keyof typeof MyOutEvents];

export type MyOutEvent = { type: typeof MyOutEvents.EXPLODED };
