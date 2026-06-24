// Libraries
import { Snapshot } from "xstate";
// Local level
import { GameRecord } from "./GameRecord";

export type PersistedGameMetadata = Omit<GameRecord, "players">;

export interface PersistedGame {
  metadata: PersistedGameMetadata;
  snapshot: Snapshot<unknown>;
}
