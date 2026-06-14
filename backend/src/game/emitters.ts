// Project level
import { START_GAME_COUNTDOWN_MS } from "game/constants";

export const GameEmitters = {
  GAME_STARTED: "GAME_STARTED",
  COUNTDOWN_STARTED: "COUNTDOWN_STARTED",
  COUNTDOWN_CANCELED: "COUNTDOWN_CANCELED",
} as const;

export type GameEmitters = (typeof GameEmitters)[keyof typeof GameEmitters];

export type GameEmitter =
  | { type: typeof GameEmitters.GAME_STARTED }
  | { type: typeof GameEmitters.COUNTDOWN_STARTED; endsAt: number }
  | { type: typeof GameEmitters.COUNTDOWN_CANCELED };

export const countdownStarted = (): GameEmitter => ({
  type: GameEmitters.COUNTDOWN_STARTED,
  endsAt: Date.now() + START_GAME_COUNTDOWN_MS,
});

export const countdownCanceled = (): GameEmitter => ({
  type: GameEmitters.COUNTDOWN_CANCELED,
});

export const gameStarted = (): GameEmitter => ({
  type: GameEmitters.GAME_STARTED,
});
