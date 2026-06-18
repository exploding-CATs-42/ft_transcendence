import type { Card } from "./card";

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  isConfirmed: boolean;
  isAlive: boolean;
  turnOrder: number;
}
