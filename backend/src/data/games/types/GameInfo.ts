import { GameId } from "./GameId";

export interface GameInfo {
  id: GameId;
  name: string;
  maxPlayers: number;
  createdAt: number;
}
