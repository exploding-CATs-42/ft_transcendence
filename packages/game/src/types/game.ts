// Libraries
import { Actor, type Snapshot } from "xstate";
// Local level
import { gameMachine } from "../gameMachine";

export interface GameRules {
  dealtCardsPerPlayer: number;
  defusesDealtPerPlayer: number;
}

export type GameInstance = Actor<typeof gameMachine>;
export type GameSnapshot = Snapshot<unknown>;
