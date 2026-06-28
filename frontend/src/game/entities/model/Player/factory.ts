// Libraries
import { createActor } from "xstate";
// Local level
import { opponentMachine } from "./opponentMachine";
import type { PlayerInstance } from "./types";

export function createPlayerMachine(): PlayerInstance {
  return createActor(opponentMachine);
}
