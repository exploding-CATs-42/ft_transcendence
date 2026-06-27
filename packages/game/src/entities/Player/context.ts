import type { Card } from "../../types";

export interface PlayerContext {
  cards: Card[];
  turnCount: number;
}
