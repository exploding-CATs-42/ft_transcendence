// All possible errors
type ErrorReason =
  | "PLAYER_HAS_ACTIVE_GAME"
  | "PLAYER_ALREADY_IN_GAME"
  | "GAME_NOT_FOUND"
  | "GAME_FULL"
  | "PLAYER_IS_NOT_IN_GAME";

type DomainError<
  TReason extends ErrorReason,
  TPayload extends object = object,
> = {
  reason: TReason;
} & TPayload;

export type PlayerHasActiveGameError = DomainError<
  "PLAYER_HAS_ACTIVE_GAME",
  { existingGameId: string }
>;
export type PlayerAlreadyInGameError = DomainError<"PLAYER_ALREADY_IN_GAME">;
export type PlayerNotInGameError = DomainError<"PLAYER_IS_NOT_IN_GAME">;
export type GameFullError = DomainError<"GAME_FULL", { maxPlayers: number }>;
export type GameNotFoundError = DomainError<"GAME_NOT_FOUND">;

// Per service errors
export type JoinGameError =
  | GameNotFoundError
  | GameFullError
  | PlayerAlreadyInGameError
  | PlayerHasActiveGameError;
export type LeaveGameError = GameNotFoundError | PlayerNotInGameError;
export type ConfirmStartError = GameNotFoundError | PlayerNotInGameError;
export type CancelStartError = GameNotFoundError | PlayerNotInGameError;
