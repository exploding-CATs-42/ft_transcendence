import type { Card } from "@exploding-cats/game-core";

export interface PlayerContext {
  cards: Card[];
  turnCount: number;
}
