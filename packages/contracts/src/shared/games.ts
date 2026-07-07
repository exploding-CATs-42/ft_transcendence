import type { WaitingPlayerView } from "../sockets";

export interface GameRecord {
  id: string;
  name: string;
  maxPlayers: number;
  createdAt: number;
  players: WaitingPlayerView[];
}
