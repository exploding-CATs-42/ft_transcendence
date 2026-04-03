import { CardInstance } from "./card";
import { GameStatus } from "./game";
import { TurnPhase, PendingAction, NopeChain, FavorState } from "./turn";

export enum ServerEventType {
  GAME_STARTED = "GAME_STARTED",
  TURN_CHANGED = "TURN_CHANGED",
  CARD_PLAYED = "CARD_PLAYED",
  COMBO_PLAYED = "COMBO_PLAYED",
  NOPE_PLAYED = "NOPE_PLAYED",
  NOPE_WINDOW_OPENED = "NOPE_WINDOW_OPENED",
  NOPE_WINDOW_CLOSED = "NOPE_WINDOW_CLOSED",
  ACTION_RESOLVED = "ACTION_RESOLVED",
  ACTION_CANCELLED = "ACTION_CANCELLED",
  CARD_DRAWN = "CARD_DRAWN",
  EXPLODING_KITTEN_DRAWN = "EXPLODING_KITTEN_DRAWN",
  PLAYER_DEFUSED = "PLAYER_DEFUSED",
  PLAYER_ELIMINATED = "PLAYER_ELIMINATED",
  KITTEN_INSERTED = "KITTEN_INSERTED",
  FAVOR_REQUESTED = "FAVOR_REQUESTED",
  FAVOR_RESOLVED = "FAVOR_RESOLVED",
  DECK_SHUFFLED = "DECK_SHUFFLED",
  PHASE_CHANGED = "PHASE_CHANGED",
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
