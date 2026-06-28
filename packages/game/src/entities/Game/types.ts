// Libraries
import { Actor, type Snapshot } from "xstate";
// Local level
import { gameMachine } from "./gameMachine";

export type GameInstance = Actor<typeof gameMachine>;
export type GameSnapshot = Snapshot<unknown>;
