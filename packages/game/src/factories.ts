// Libraries
import { createActor } from "xstate";
// Local level
import type { GameInstance, GameSnapshot } from "./types";
import { gameMachine } from "./gameMachine";

export const createGameInstance = (snapshot?: GameSnapshot): GameInstance => {
  if (snapshot) {
    return createActor(gameMachine, { snapshot });
  }

  return createActor(gameMachine);
};
