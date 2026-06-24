import { GameId } from "./GameId";

export interface GameRecord {
  id: GameId;
  name: string;
  maxPlayers: number;
  createdAt: number;
}
