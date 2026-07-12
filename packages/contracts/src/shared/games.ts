import type { ProfileUser } from "./users";

export interface GameRecord {
  id: string;
  name: string;
  maxPlayers: number;
  createdAt: number;
  players: ProfileUser[];
}
