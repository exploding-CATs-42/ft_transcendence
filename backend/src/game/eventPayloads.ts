// Project level
import { PlayerId } from "types";
// Local level
import { Card } from "./types";

export interface Hand {
  playerId: PlayerId;
  cards: Card[];
}
