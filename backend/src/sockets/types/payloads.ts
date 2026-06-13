// Project level
import {
  WaitingPlayerView,
  WaitingStateView,
} from "@exploding-cats/shared-types";
import { CardInstance, PendingActionType } from "game/types";

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
