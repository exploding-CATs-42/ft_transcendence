export const GameEmitterType = {
  COUNTDOWN_STARTED: "COUNTDOWN_STARTED",
  COUNTDOWN_CANCELED: "COUNTDOWN_CANCELED",
} as const;

export type GameEmitterType =
  (typeof GameEmitterType)[keyof typeof GameEmitterType];

export type GameEmitter =
  | { type: typeof GameEmitterType.COUNTDOWN_STARTED; endsAt: number }
  | { type: typeof GameEmitterType.COUNTDOWN_CANCELED };
