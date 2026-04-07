import { CardInstance } from "./card";
import { GameStatus } from "./game";
import {
  TurnPhase,
  PendingAction,
  PendingActionType,
  NopeChain,
  FavorState
} from "./turn";

export enum ServerEventType {
  GAME_STARTED = "GAME_STARTED",
  TURN_CHANGED = "TURN_CHANGED",
  CARD_PLAYED = "CARD_PLAYED",
  COMBO_PLAYED = "COMBO_PLAYED",
  NOPE_PLAYED = "NOPE_PLAYED",
  NOPE_WINDOW_RESOLVED = "NOPE_WINDOW_RESOLVED",
  CARD_DRAWN = "CARD_DRAWN",
  EXPLODING_KITTEN_DRAWN = "EXPLODING_KITTEN_DRAWN",
  PLAYER_DEFUSED = "PLAYER_DEFUSED",
  PLAYER_ELIMINATED = "PLAYER_ELIMINATED",
  KITTEN_INSERTED = "KITTEN_INSERTED",
  FAVOR_REQUESTED = "FAVOR_REQUESTED",
  FAVOR_RESOLVED = "FAVOR_RESOLVED",
  DECK_SHUFFLED = "DECK_SHUFFLED",
  GAME_OVER = "GAME_OVER"
}

export interface PublicGameView {
  gameId: string;
  status: GameStatus;
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
  playerId: string;
  displayName: string;
  handSize: number;
  isAlive: boolean;
  turnOrder: number;
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

export enum PrivateEventType {
  YOUR_HAND = "YOUR_HAND",
  CARD_RECEIVED = "CARD_RECEIVED",
  CARD_REMOVED = "CARD_REMOVED",
  SEE_THE_FUTURE_PEEK = "SEE_THE_FUTURE_PEEK",
  DEFUSE_PROMPT = "DEFUSE_PROMPT",
  INSERT_KITTEN_PROMPT = "INSERT_KITTEN_PROMPT",
  FAVOR_MUST_GIVE = "FAVOR_MUST_GIVE"
}

export enum CardRemovalReason {
  PLAYED = "PLAYED",
  STOLEN = "STOLEN",
  GIVEN_AWAY = "GIVEN_AWAY",
  EXPLODED = "EXPLODED"
}

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
