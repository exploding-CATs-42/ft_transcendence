// Local level
import type { Card } from "./types";

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
  card: Card;
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
