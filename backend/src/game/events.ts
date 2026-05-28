import { Player } from "./types";

export const GameEventType = {
  JOIN_GAME: "JOIN_GAME",
  LEAVE_GAME: "LEAVE_GAME",
  MARK_READY: "MARK_READY",
  MARK_UNREADY: "MARK_UNREADY",
} as const;

export type GameEventType = (typeof GameEventType)[keyof typeof GameEventType];

export type GameEvent =
  | { type: typeof GameEventType.JOIN_GAME; player: Player }
  | { type: typeof GameEventType.LEAVE_GAME; playerId: Player["id"] }
  | { type: typeof GameEventType.MARK_READY; playerId: Player["id"] }
  | { type: typeof GameEventType.MARK_UNREADY; playerId: Player["id"] };
