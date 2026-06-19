// Project level
import { WaitingPlayerView, WaitingStateView } from "@exploding-cats/contracts";
import { Card, PendingActionType } from "@exploding-cats/game-core";

export interface JoinGameResult {
  player: WaitingPlayerView;
  waitingState: WaitingStateView;
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

export const CardRemovalReason = {
  PLAYED: "PLAYED",
  STOLEN: "STOLEN",
  GIVEN_AWAY: "GIVEN_AWAY",
  EXPLODED: "EXPLODED",
} as const;

export type CardRemovalReason =
  (typeof CardRemovalReason)[keyof typeof CardRemovalReason];

export interface YourHandPayload {
  hand: Card[];
}

export interface CardReceivedPayload {
  card: Card;
  fromId: string | null;
}

export interface CardRemovedPayload {
  cardId: string;
  reason: CardRemovalReason;
}

export interface SeeTheFuturePeekPayload {
  cards: Card[];
}

export interface InsertKittenPromptPayload {
  deckSize: number;
}

export interface FavorMustGivePayload {
  requesterId: string;
  requesterName: string;
}
