// Local level
import type { Card } from "./types";

export interface HandPayload {
  playerId: string;
  cards: Card[];
}

export interface TurnChangedPayload {
  playerId: string;
}

export interface CardPayload {
  playerId: string;
  card: Card;
}

export interface DropCardPayload {
  gameId: string;
}
