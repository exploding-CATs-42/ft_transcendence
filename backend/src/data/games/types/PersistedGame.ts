// Libraries
import { Snapshot } from "xstate";
// Local level
import { GameRecord } from "./GameRecord";

export interface PersistedGame {
  snapshot: Snapshot<unknown>;
  metadata: GameRecord;
}
