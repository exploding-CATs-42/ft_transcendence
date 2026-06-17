// Libraries
import { createActor, Snapshot } from "xstate";
// Local level
import { GameInstance } from "./types";
import { gameMachine } from "./gameMachine";

export const createGameInstance = (
  snapshot?: Snapshot<unknown>,
): GameInstance => {
  if (snapshot) {
    return createActor(gameMachine, { snapshot });
  }

  return createActor(gameMachine);
};
