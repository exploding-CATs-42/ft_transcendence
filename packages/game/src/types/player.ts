import type { Card } from "./card";

export interface Player {
  id: string;
  name: string;
  avatarUrl: string | null;
  hand: Card[];
  isConfirmed: boolean;
  isAlive: boolean;
  turnOrder: number;
}
