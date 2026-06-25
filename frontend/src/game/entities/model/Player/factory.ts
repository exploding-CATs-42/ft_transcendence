// Libraries
import { createActor } from "xstate";
// Local level
import { playerMachine } from "./playerMachine";
import type { PlayerContext } from "./context";
import { getStrategy } from "./strategies";

export function createPlayerMachine(input: PlayerContext) {
  const strategy = getStrategy(input);

  const machine = playerMachine.provide({
    guards: strategy.guards,
    actions: strategy.actions,
  });

  return createActor(machine, { input });
}
