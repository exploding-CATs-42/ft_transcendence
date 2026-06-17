import { Actor } from "xstate";
import { gameMachine } from "./gameMachine";
import { GameInfo } from "data/types";

export interface GameInstance {
  info: GameInfo;
  actor: Actor<typeof gameMachine>;
}
