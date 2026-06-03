import { CardInstance } from "./card";

export interface Player {
  id: string;
  name: string;
  hand: CardInstance[];
  isConfirmed: boolean;
  isAlive: boolean;
  turnOrder: number;
}
