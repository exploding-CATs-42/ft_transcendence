import type { GameRecord as SharedGameRecord } from "@exploding-cats/contracts";
import { GameId } from "./GameId";

export interface GameMetadata extends Omit<SharedGameRecord, "id" | "players"> {
  id: GameId;
}

export interface GameRecord extends GameMetadata {
  players: SharedGameRecord["players"];
}
