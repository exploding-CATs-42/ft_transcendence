// Local level
import type { Card, CardType } from "./types";

export interface TurnChangedPayload {
  playerId: string;
  attackCount: number;
}

export interface TurnSkippedPayload {
  playerId: string;
  attackCount: number;
}

export interface ShowedCardsToPlayerPayload {
  playerId: string;
  cards: Card[];
}

export interface PlayerDefusedPayload {
  playerId: string;
  deckSize: number;
}

export interface DefusePromptPayload {
  playerId: string;
  endsAt: number;
  canDefuse: boolean;
}

export interface KittenInsertedPayload {
  playerId: string;
  cardId: number;
}

export interface PlayerEliminatedPayload {
  playerId: string;
}

export interface WinnerView {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface GameOverPayload {
  winner: WinnerView;
}

export interface PlayerSelectedPayload {
  playerId: string;
}

export interface WaitingForCardIdSelectionPayload {
  playerId: string;
}

export interface PlayerSawTheFuturePayload {
  playerId: string;
}

export interface WaitingForCardIndexSelectionPayload {
  targetPlayerId: string;
}

export interface WaitingForCardTypeSelectionPayload {
  targetPlayerId: string;
}

export const CardReceivalReason = {
  DRAW: "DRAW",
  FAVOR: "FAVOR",
  CAT_PAIR: "CAT_PAIR",
  CAT_TRIPLE: "CAT_TRIPLE",
} as const;

export type CardReceivalReason =
  (typeof CardReceivalReason)[keyof typeof CardReceivalReason];

export interface CardGivenPayload {
  card: Card;
  playerIdFrom: string;
  playerIdTo: string;
  reason: CardReceivalReason;
}

export interface NoCardOfRequestedTypePayload {
  cardType: CardType;
  targetPlayerId: string;
}
