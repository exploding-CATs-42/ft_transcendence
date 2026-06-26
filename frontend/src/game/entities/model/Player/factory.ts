// Libraries
import { Actor, createActor } from "xstate";
// Local level
import { playerMachine } from "./playerMachine";
import type { PlayerContext } from "./context";
import { getStrategy } from "./strategies";

export type PlayerInstance = Actor<typeof playerMachine>;

export function createPlayerMachine(input: PlayerContext): PlayerInstance {
  const strategy = getStrategy(input);

  const machine = playerMachine.provide({
    guards: strategy.guards,
    actions: strategy.actions,
  });

  return createActor(machine, { input });
}
