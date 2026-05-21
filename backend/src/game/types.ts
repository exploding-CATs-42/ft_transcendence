import { Actor } from "xstate";
import { CardInstance, UserId } from "../types";
import { gameMachine } from "./gameMachine";

export interface Player {
  id: UserId;
  name: string;
  hand: CardInstance[];
  isAlive: boolean;
  turnOrder: number;
}

export interface GameInfo {
  id: string;
  name: string;
  maxPlayers: number;
  createdAt: number;
}

export interface Game {
  info: GameInfo;
  actor: Actor<typeof gameMachine>;
}
