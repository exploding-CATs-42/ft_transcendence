import type { PlayerStatus } from "@exploding-cats/game-core";

export interface Player {
  id: string;
  name: string;
  avatarUrl: string | null;
  isAlive: boolean;
  status: PlayerStatus;
}
