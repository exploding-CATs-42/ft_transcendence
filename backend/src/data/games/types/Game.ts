// Project level
import { GameInstance } from "@exploding-cats/game-core";
// Local level
import { GameMetadata } from "./GameRecord";

export interface Game extends GameMetadata {
  instance: GameInstance;
}
