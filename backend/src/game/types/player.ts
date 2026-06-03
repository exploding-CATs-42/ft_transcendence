import { CardInstance } from "./card";
import { UserId } from "../../types/auth";

export interface Player {
  id: UserId;
  name: string;
  hand: CardInstance[];
  isConfirmed: boolean;
  isAlive: boolean;
  turnOrder: number;
}
