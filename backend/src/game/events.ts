import { Player } from "./types/player";

export const GameEvents = {
  JOIN_GAME: "JOIN_GAME",
  LEAVE_GAME: "LEAVE_GAME",
  CONFIRM_START: "CONFIRM_START",
  CANCEL_START: "CANCEL_START",
} as const;

export type GameEvents = (typeof GameEvents)[keyof typeof GameEvents];

export type GameEvent =
  | { type: typeof GameEvents.JOIN_GAME; player: Player }
  | { type: typeof GameEvents.LEAVE_GAME; playerId: Player["id"] }
  | { type: typeof GameEvents.CONFIRM_START; playerId: Player["id"] }
  | { type: typeof GameEvents.CANCEL_START; playerId: Player["id"] };
