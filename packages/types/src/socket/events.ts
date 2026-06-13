export const ClientEvents = {
  JOIN_GAME: "join-game",
  LEAVE_GAME: "leave-game",
  CONFIRM_START: "confirm-start",
  CANCEL_START: "cancel-start",
} as const;

export type ClientEvents =
  (typeof ClientEvents)[keyof typeof ClientEvents];

export const PublicEventType = {
  PLAYER_JOINED: "player-joined",
  PLAYER_LEFT: "player-left",
  PLAYER_CONFIRMED: "player-confirmed",
  PLAYER_CANCELED: "player-canceled",
  COUNTDOWN_STARTED: "countdown-started",
  COUNTDOWN_CANCELED: "countdown-canceled",
  GAME_STARTED: "game-started",
  TURN_CHANGED: "TURN_CHANGED",
  CARD_PLAYED: "CARD_PLAYED",
  COMBO_PLAYED: "COMBO_PLAYED",
  NOPE_PLAYED: "NOPE_PLAYED",
  NOPE_WINDOW_RESOLVED: "NOPE_WINDOW_RESOLVED",
  CARD_DRAWN: "CARD_DRAWN",
  EXPLODING_KITTEN_DRAWN: "EXPLODING_KITTEN_DRAWN",
  PLAYER_DEFUSED: "PLAYER_DEFUSED",
  PLAYER_ELIMINATED: "PLAYER_ELIMINATED",
  KITTEN_INSERTED: "KITTEN_INSERTED",
  FAVOR_REQUESTED: "FAVOR_REQUESTED",
  FAVOR_RESOLVED: "FAVOR_RESOLVED",
  DECK_SHUFFLED: "DECK_SHUFFLED",
  GAME_OVER: "GAME_OVER",
} as const;

export type PublicEventType =
  (typeof PublicEventType)[keyof typeof PublicEventType];

export const PrivateEventType = {
  LEFT_GAME: "left-game",
  WAITING_STATE: "waiting-state",
  YOUR_HAND: "YOUR_HAND",
  CARD_RECEIVED: "CARD_RECEIVED",
  CARD_REMOVED: "CARD_REMOVED",
  SEE_THE_FUTURE_PEEK: "SEE_THE_FUTURE_PEEK",
  DEFUSE_PROMPT: "DEFUSE_PROMPT",
  INSERT_KITTEN_PROMPT: "INSERT_KITTEN_PROMPT",
  FAVOR_MUST_GIVE: "FAVOR_MUST_GIVE",
} as const;

export type PrivateEventType =
  (typeof PrivateEventType)[keyof typeof PrivateEventType];

export const ErrorEventType = {
  JOIN_GAME_ERROR: "join-game-error",
  LEAVE_GAME_ERROR: "leave-game-error",
  CONFIRM_START_ERROR: "confirm-start-error",
  CANCEL_START_ERROR: "cancel-start-error",
} as const;

export type ErrorEventType =
  (typeof ErrorEventType)[keyof typeof ErrorEventType];
