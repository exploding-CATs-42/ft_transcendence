// Libraries
import { createActor, Snapshot } from "xstate";
// Local level
import { GameInstance, Player } from "./types";
import { gameMachine } from "./gameMachine";

export const createGameInstance = (
  snapshot?: Snapshot<unknown>,
): GameInstance => {
  if (snapshot) {
    return createActor(gameMachine, { snapshot });
  }

  return createActor(gameMachine);
};

export const createPlayer = (id: string): Player => {
  return {
    id,
    hand: [],
    isConfirmed: false,
    isAlive: true,
    turnOrder: 0,
  };
};
