// Libraries
import { Snapshot } from "xstate";
// Local level
import { GameRecord } from "./GameRecord";

export interface PersistedGame {
  info: GameRecord;
  snapshot: Snapshot<unknown>;
}
