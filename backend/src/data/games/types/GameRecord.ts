import { GameId } from "./GameId";

export type GameRecordPlayer = {
  id: string;
  username: string;
  avatarUrl: string | null;
};

export interface GameRecord {
  id: GameId;
  name: string;
  maxPlayers: number;
  createdAt: number;
  players: GameRecordPlayer[];
}
