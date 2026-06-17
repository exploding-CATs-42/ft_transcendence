import { Actor } from "xstate";
import { gameMachine } from "./gameMachine";
import { GameRecord } from "data/types";

export interface GameInstance {
  info: GameRecord;
  actor: Actor<typeof gameMachine>;
}
