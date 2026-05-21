import { Player } from "./types";

export const GameEventType = {
  START_GAME: "START_GAME",
  JOIN_GAME: "JOIN_GAME",
  LEAVE_GAME: "LEAVE_GAME",
} as const;

export type GameEventType = (typeof GameEventType)[keyof typeof GameEventType];

export type GameEvent =
  | { type: typeof GameEventType.START_GAME }
  | { type: typeof GameEventType.JOIN_GAME; player: Player }
  | { type: typeof GameEventType.LEAVE_GAME; playerId: Player["id"] };
