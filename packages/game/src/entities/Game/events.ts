import type { Player } from "../../types";
import type { HandPayload } from "./eventPayloads";

// Events sent TO the machine
export const GameEvents = {
  JOIN_GAME: "JOIN_GAME",
  LEAVE_GAME: "LEAVE_GAME",
  CONFIRM_READINESS: "CONFIRM_READINESS",
  CANCEL_READINESS: "CANCEL_READINESS",
} as const;

export type GameEvents = (typeof GameEvents)[keyof typeof GameEvents];

export type GameEvent =
  | { type: typeof GameEvents.JOIN_GAME; player: Player }
  | { type: typeof GameEvents.LEAVE_GAME; playerId: Player["id"] }
  | { type: typeof GameEvents.CONFIRM_READINESS; playerId: Player["id"] }
  | { type: typeof GameEvents.CANCEL_READINESS; playerId: Player["id"] };

// Events emitted FROM the machine
export const GameOutEvents = {
  COUNTDOWN_STARTED: "COUNTDOWN_STARTED",
  COUNTDOWN_CANCELED: "COUNTDOWN_CANCELED",
  GAME_STARTED: "GAME_STARTED",
  CARDS_DEALT: "CARDS_DEALT",
} as const;

export type GameOutEvents = (typeof GameOutEvents)[keyof typeof GameOutEvents];

export type GameOutEvent =
  | { type: typeof GameOutEvents.COUNTDOWN_STARTED; endsAt: number }
  | { type: typeof GameOutEvents.COUNTDOWN_CANCELED }
  | { type: typeof GameOutEvents.GAME_STARTED }
  | { type: typeof GameOutEvents.CARDS_DEALT; payload: HandPayload[] };
