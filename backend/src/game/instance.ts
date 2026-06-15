// Libraries
import { Actor } from "xstate";
// Local level
import { gameMachine } from "./gameMachine";

export interface GameInfo {
  id: string;
  name: string;
  maxPlayers: number;
  createdAt: number;
}

export interface GameInstance {
  info: GameInfo;
  actor: Actor<typeof gameMachine>;
}
