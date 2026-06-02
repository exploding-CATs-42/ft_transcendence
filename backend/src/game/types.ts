import { Actor } from "xstate";
import { gameMachine } from "./gameMachine";

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
