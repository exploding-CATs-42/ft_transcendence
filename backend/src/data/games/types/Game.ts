// Project level
import { GameInstance } from "@exploding-cats/game-core";
// Local level
import { GameRecord } from "./GameRecord";

export interface Game extends GameRecord {
  instance: GameInstance;
}
