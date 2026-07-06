import type { WaitingPlayerView } from "@exploding-cats/contracts";
import { GameId } from "./GameId";

export interface GameMetadata {
  id: GameId;
  name: string;
  maxPlayers: number;
  createdAt: number;
}

export interface GameRecord extends GameMetadata {
  players: WaitingPlayerView[];
}
