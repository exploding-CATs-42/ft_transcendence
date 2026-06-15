import { Actor } from "xstate";
import { gameMachine } from "./gameMachine";

export interface GameInfo {
  id: string;
  name: string;
  maxPlayers: number;
  createdAt: number;
  ownerId: string;
}

export interface GameInstance {
  info: GameInfo;
  actor: Actor<typeof gameMachine>;
}
