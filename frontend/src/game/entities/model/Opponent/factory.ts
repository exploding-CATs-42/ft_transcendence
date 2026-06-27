// Libraries
import { createActor } from "xstate";
// Local level
import { opponentMachine } from "./opponentMachine";
import type { OpponentInstance } from "./types";

export function createOpponentMachine(): OpponentInstance {
  return createActor(opponentMachine);
}
