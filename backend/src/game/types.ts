import { CardInstance, UserId } from "../types";

export interface Player {
  id: UserId;
  name: string;
  hand: CardInstance[];
  isAlive: boolean;
  turnOrder: number;
}
