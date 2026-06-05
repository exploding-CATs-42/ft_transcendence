import { Player } from "./types";

export const GameEventType = {
  JOIN_GAME: "JOIN_GAME",
  LEAVE_GAME: "LEAVE_GAME",
  CONFIRM_START: "CONFIRM_START",
  CANCEL_START: "CANCEL_START",
} as const;

export type GameEventType = (typeof GameEventType)[keyof typeof GameEventType];

export type GameEvent =
  | { type: typeof GameEventType.JOIN_GAME; player: Player }
  | { type: typeof GameEventType.LEAVE_GAME; playerId: Player["id"] }
  | { type: typeof GameEventType.CONFIRM_START; playerId: Player["id"] }
  | { type: typeof GameEventType.CANCEL_START; playerId: Player["id"] };
