// Libraries
import { GameSnapshot } from "@exploding-cats/game-core";
// Local level
import { GameRecord } from "./GameRecord";

export interface PersistedGame {
  metadata: GameRecord;
  snapshot: GameSnapshot;
}
