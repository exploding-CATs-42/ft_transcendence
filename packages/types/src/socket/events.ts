export const ClientEventType = {
  JOIN_GAME: "join-game",
  LEAVE_GAME: "leave-game",
  CONFIRM_START: "confirm-start",
  CANCEL_START: "cancel-start",
} as const;

export type ClientEventType =
  (typeof ClientEventType)[keyof typeof ClientEventType];

export const ErrorEventType = {
  JOIN_GAME_ERROR: "join-game-error",
  LEAVE_GAME_ERROR: "leave-game-error",
  CONFIRM_START_ERROR: "confirm-start-error",
  CANCEL_START_ERROR: "cancel-start-error",
} as const;

export type ErrorEventType =
  (typeof ErrorEventType)[keyof typeof ErrorEventType];
