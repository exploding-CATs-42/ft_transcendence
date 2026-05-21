export const GameEventType = {
  START_GAME: "START_GAME",
} as const;

export type GameEventType = (typeof GameEventType)[keyof typeof GameEventType];

export type GameEvent = { type: typeof GameEventType.START_GAME };
