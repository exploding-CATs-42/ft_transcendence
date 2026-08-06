// Local level
import type { Card, ComboSize } from "./types";

export interface TurnChangedPayload {
  playerId: string;
  attackCount: number;
}

export interface TurnSkippedPayload {
  playerId: string;
  attackCount: number;
}

export interface CardPayload {
  playerId: string;
  card: Card;
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

export interface ExplodingKittenDrawnPayload {
  kittensInDeck: number;
}

export interface KittenInsertedPayload {
  playerId: string;
  cardId: number;
  kittensInDeck: number;
}

export interface PlayerEliminatedPayload {
  playerId: string;
  kittensInDeck: number;
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

export interface WaitingForFavorCardSelectionPayload {
  playerId: string;
}

export interface PlayerSawTheFuturePayload {
  playerId: string;
}

export interface ComboSelectionRequestedPayload {
  playerId: string;
  comboSize: ComboSize;
  targets: Array<{ playerId: string; handSize: number }>;
  targetPlayerId?: string;
  requestedCardType?: Card["type"];
}
