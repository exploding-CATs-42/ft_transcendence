export type GameId = string;

export interface GameRecord {
  id: GameId;
  name: string;
  maxPlayers: number;
  createdAt: number;
}
