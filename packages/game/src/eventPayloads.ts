// Local level
import type { Card } from "./types";

export interface TurnChangedPayload {
  playerId: string;
}

export interface CardPayload {
  playerId: string;
  card: Card;
}
