// Libraries
import { GameSnapshot } from "@exploding-cats/game-core";
// Local level
import { GameMetadata } from "./GameRecord";

export interface PersistedGame {
  metadata: GameMetadata;
  snapshot: GameSnapshot;
}
