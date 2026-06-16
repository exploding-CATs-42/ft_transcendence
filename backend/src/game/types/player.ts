import { Card } from "./card";

export interface Player {
  id: string;
  hand: Card[];
  isConfirmed: boolean;
  isAlive: boolean;
  turnOrder: number;
}
