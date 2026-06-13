export const ClientEventType = {
  JOIN_GAME: "join-game",
  LEAVE_GAME: "leave-game",
  CONFIRM_START: "confirm-start",
  CANCEL_START: "cancel-start",
} as const;

export type ClientEventType =
  (typeof ClientEventType)[keyof typeof ClientEventType];
