export const SocketErrorCodes = {
  RECONNECT_REQUIRED: "RECONNECT_REQUIRED",
  GAME_IN_PROGRESS: "GAME_IN_PROGRESS",
  GAME_FULL: "GAME_FULL",
  ALREADY_IN_OTHER_GAME: "ALREADY_IN_OTHER_GAME",
  UNKNOWN: "UNKNOWN",
} as const;

export type SocketErrorCode =
  (typeof SocketErrorCodes)[keyof typeof SocketErrorCodes];

export interface SocketErrorPayload {
  code: SocketErrorCode;
  message: string;
  errors?: unknown;
}
