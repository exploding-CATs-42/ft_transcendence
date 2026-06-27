// Events sent TO the machine
export const PlayerEvents = {
  CONFIRM_READINESS: "CONFIRM_READINESS",
  CANCEL_READINESS: "CANCEL_READINESS",
  GAME_STARTED: "GAME_STARTED",
  GAME_ENDED: "GAME_ENDED",
} as const;

export type PlayerEvents = (typeof PlayerEvents)[keyof typeof PlayerEvents];

export type PlayerEvent =
  | { type: typeof PlayerEvents.CONFIRM_READINESS }
  | { type: typeof PlayerEvents.CANCEL_READINESS }
  | { type: typeof PlayerEvents.GAME_STARTED }
  | { type: typeof PlayerEvents.GAME_ENDED };

// Events emitted FROM the machine
export const PlayerOutEvents = {
  READINESS_CONFIRMED: "READINESS_CONFIRMED",
  READINESS_CANCELED: "READINESS_CANCELED",
} as const;

export type PlayerOutEvents =
  (typeof PlayerOutEvents)[keyof typeof PlayerOutEvents];

export type PlayerOutEvent =
  | { type: typeof PlayerOutEvents.READINESS_CONFIRMED; playerId: string }
  | { type: typeof PlayerOutEvents.READINESS_CANCELED; playerId: string };
