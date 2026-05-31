import { START_GAME_COUNTDOWN_MS } from "../constants/game";

export const GameEmitterType = {
  GAME_STARTED: "GAME_STARTED",
  COUNTDOWN_STARTED: "COUNTDOWN_STARTED",
  COUNTDOWN_CANCELED: "COUNTDOWN_CANCELED",
} as const;

export type GameEmitterType =
  (typeof GameEmitterType)[keyof typeof GameEmitterType];

export type GameEmitter =
  | { type: typeof GameEmitterType.GAME_STARTED }
  | { type: typeof GameEmitterType.COUNTDOWN_STARTED; endsAt: number }
  | { type: typeof GameEmitterType.COUNTDOWN_CANCELED };

export const countdownStarted = (): GameEmitter => ({
  type: GameEmitterType.COUNTDOWN_STARTED,
  endsAt: Date.now() + START_GAME_COUNTDOWN_MS,
});

export const countdownCanceled = (): GameEmitter => ({
  type: GameEmitterType.COUNTDOWN_CANCELED,
});

export const gameStarted = (): GameEmitter => ({
  type: GameEmitterType.GAME_STARTED,
});
