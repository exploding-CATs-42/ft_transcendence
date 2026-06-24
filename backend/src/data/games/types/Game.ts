// Project level
import { GameInstance } from "game/types";
// Local level
import { GameRecord } from "./GameRecord";

export interface Game extends Omit<GameRecord, "players"> {
  instance: GameInstance;
}
