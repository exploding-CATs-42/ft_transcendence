import type { Card, CardType } from "@exploding-cats/game-core";
import type {
  PublicPlayerView,
  WaitingPlayerView,
  WaitingStateView,
} from "./views";
import type { UserId } from "../shared";

export interface PlayerIdPayload {
  playerId: string;
}

export interface PlayerJoinedPayload {
  player: WaitingPlayerView;
}

export interface CountdownStartedPayload {
  endsAt: number;
}

export interface WaitingStatePayload {
  waitingState: WaitingStateView;
}

export interface GameStartedPayload {
  players: PublicPlayerView[];
  hand: Card[];
}

export interface CardPlayedPayload {
  playerId: string;
  cardType: CardType;
  nopeWindowExpiresAt: number;
}

export const CardRemovalReason = {
  PLAYED: "PLAYED",
  STOLEN: "STOLEN",
  GIVEN_AWAY: "GIVEN_AWAY",
  EXPLODED: "EXPLODED",
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
}

export interface FriendOnlineStatusChangedPayload {
  userId: UserId;
  isOnline: boolean;
}
