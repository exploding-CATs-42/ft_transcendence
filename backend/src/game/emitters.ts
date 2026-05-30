export const GameEmitterType = {
  COUNTDOWN_STARTED: "COUNTDOWN_STARTED",
} as const;

export type GameEmitterType =
  (typeof GameEmitterType)[keyof typeof GameEmitterType];

export type GameEmitter = {
  type: typeof GameEmitterType.COUNTDOWN_STARTED;
  endsAt: number;
};
