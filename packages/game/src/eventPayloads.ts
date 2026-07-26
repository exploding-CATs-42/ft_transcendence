// Local level
import type { Card } from "./types";

export interface TurnChangedPayload {
  playerId: string;
}

export interface TurnSkippedPayload {
  playerId: string;
}

export interface CardPayload {
  playerId: string;
  card: Card;
}

export interface ShowedCardsToPlayerPayload {
  playerId: string;
  cards: Card[];
}
