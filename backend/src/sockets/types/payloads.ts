// Project level
import { WaitingPlayerView, WaitingStateView } from "@exploding-cats/contracts";
import { Card, PendingActionType } from "@exploding-cats/game-core";

export interface JoinGameResult {
  player: WaitingPlayerView;
  waitingState: WaitingStateView;
  countdownEndsAt: number | null;
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

export interface CardReceivedPayload {
  card: Card;
  fromId: string | null;
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
