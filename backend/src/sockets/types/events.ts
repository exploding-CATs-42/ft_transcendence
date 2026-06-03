import {
  TurnPhase,
  PendingAction,
  PendingActionType,
  NopeChain,
  FavorState,
  CardInstance,
} from "../../game/types";

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

export interface PublicGameView {
  gameId: string;
  turn: PublicTurnView;
  players: PublicPlayerView[];
  deckSize: number;
  discardPileTop: CardInstance | null;
  winnerId: string | null;
}

export interface PublicTurnView {
  currentPlayerId: string;
  phase: TurnPhase;
  attackCount: number;
  isUnderAttack: boolean;
  pendingAction: PendingAction | null;
  nopeChain: NopeChain | null;
  favorState: FavorState | null;
  turnNumber: number;
}

export interface PublicPlayerView {
  id: string;
  name: string;
  handSize: number;
  isAlive: boolean;
  turnOrder: number;
}

export interface WaitingPlayerView {
  id: string;
  name: string;
  isConfirmed: boolean;
}

export interface WaitingStateView {
  players: WaitingPlayerView[];
}

export interface JoinGameResult {
  player: WaitingPlayerView;
  waitingState: WaitingStateView;
}

export interface PlayerIdPayload {
  playerId: string;
}

export interface CardPlayedPayload {
  playerId: string;
  cardType: string;
  actionId: string;
  nopeWindowExpiresAt: number;
}

export interface ComboPlayedPayload {
  playerId: string;
  cardTypes: string;
  cardCount: number;
  targetPlayerId: string;
  actionId: string;
  nopeWindowExpiresAt: number;
}

export interface NopePlayedPayload {
  playerId: string;
  actionId: string;
  nopeWindowExpiresAt: number;
}

export interface NopeWindowResolvedPayload {
  actionId: string;
  type: PendingActionType;
  executed: boolean;
}

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

export const CardRemovalReason = {
  PLAYED: "PLAYED",
  STOLEN: "STOLEN",
  GIVEN_AWAY: "GIVEN_AWAY",
  EXPLODED: "EXPLODED",
} as const;

export type CardRemovalReason =
  (typeof CardRemovalReason)[keyof typeof CardRemovalReason];

export interface YourHandPayload {
  hand: CardInstance[];
}

export interface CardReceivedPayload {
  card: CardInstance;
  fromId: string | null;
}

export interface CardRemovedPayload {
  cardInstanceId: string;
  reason: CardRemovalReason;
}

export interface SeeTheFuturePeekPayload {
  cards: CardInstance[];
}

export interface InsertKittenPromptPayload {
  deckSize: number;
}

export interface FavorMustGivePayload {
  requesterId: string;
  requesterName: string;
}
