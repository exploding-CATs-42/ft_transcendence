// Libraries
import { Snapshot } from "xstate";
// Local level
import { GameRecord } from "./GameRecord";

export interface PersistedGame {
  metadata: GameRecord;
  snapshot: Snapshot<unknown>;
}
