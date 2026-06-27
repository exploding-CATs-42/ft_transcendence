// Libraries
import { createActor } from "xstate";
// Local level
import { playerMachine } from "./playerMachine";
import type { PlayerInstance } from "./types";

export function createPlayerMachine(): PlayerInstance {
  return createActor(playerMachine);
}
