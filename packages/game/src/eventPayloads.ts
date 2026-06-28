// Local level
import type { Card } from "./types";

export interface HandPayload {
  playerId: string;
  cards: Card[];
}

export interface TurnChangedPayload {
  playerId: string;
}
