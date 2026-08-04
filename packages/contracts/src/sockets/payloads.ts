import type {
  Card,
  CardType,
  ComboSize,
  ShowedCardsToPlayerPayload,
  GameStates,
} from "@exploding-cats/game-core";
import type { GameRecord } from "../shared";
import type {
  PublicPlayerView,
  WaitingPlayerView,
  WaitingStateView,
} from "./views";
import type { SocketErrorCode } from "./errors";
import type { UserId } from "../shared";

export interface PlayerIdPayload {
  playerId: string;
}

export interface PlayerJoinedPayload {
  player: WaitingPlayerView;
}

export interface LobbyGameUpdatedPayload {
  game: GameRecord;
}

export interface LobbyGameRemovedPayload {
  gameId: string;
}

export interface CountdownStartedPayload {
  endsAt: number;
}

export interface WaitingStatePayload {
  waitingState: WaitingStateView;
  meId: string;
  countdownEndsAt: number | null;
}

export interface GameStartedPayload {
  players: PublicPlayerView[];
  hand: Card[];
  deckSize: number;
}

export interface CardPlayedPayload {
  playerId: string;
  cardType: CardType;
  nopeWindowExpiresAt: number;
}

export interface NopePlayedPayload {
  playerId: string;
  nopeWindowExpiresAt: number;
}

export interface ComboPlayedPayload {
  playerId: string;
  cardTypes: CardType[];
  nopeWindowExpiresAt: number;
}

export interface ComboSelectionRequestedPayload {
  playerId: string;
  comboSize: ComboSize;
  targets: Array<{ playerId: string; handSize: number }>;
  targetPlayerId?: string;
  requestedCardType?: CardType;
}

export interface ComboResolvedPayload {
  playerId: string;
  targetPlayerId: string;
  comboSize: ComboSize;
  requestedCardType?: CardType;
  cardStolen: boolean;
}

export const CardRemovalReason = {
  PLAYED: "PLAYED",
  STOLEN: "STOLEN",
  GIVEN_AWAY: "GIVEN_AWAY",
  EXPLODED: "EXPLODED",
  INSERTED_INTO_DECK: "INSERTED_INTO_DECK",
} as const;

export type CardRemovalReason =
  (typeof CardRemovalReason)[keyof typeof CardRemovalReason];

export interface CardRemovedPayload {
  cardId: number;
  reason: CardRemovalReason;
}

export interface GameStatePayload {
  players: PublicPlayerView[];
  hand: Card[];
  currentTurnPlayerId: string | null;
  deckSize: number;
  lastPlayedCards: Card[] | null;
  attackCount: number;
  selectedPlayerId: string | null;
  countdownEndsAt: number | null;
  topCards: Card[] | null;
  machineState: GameStates | null;
  pendingComboSize: ComboSize | null;
  pendingComboTargetPlayerId: string | null;
  pendingComboRequestedCardType: CardType | null;
}

export interface FriendOnlineStatusChangedPayload {
  userId: UserId;
  isOnline: boolean;
}

export type SocketAckPayload =
  | { ok: true }
  | { ok: false; code: SocketErrorCode; message: string };

export type SeeTheFuturePeekPayload = ShowedCardsToPlayerPayload;

export interface CardGivenPayload {
  playerIdFrom: string;
  playerIdTo: string;
}

export interface ComboTargetSelectedPayload {
  playerId: string;
  targetPlayerId: string;
}
