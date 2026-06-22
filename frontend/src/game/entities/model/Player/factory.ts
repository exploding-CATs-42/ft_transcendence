// Libraries
import { assign } from "xstate";
// Local level
import { playerMachine } from "./playerMachine";
import type { PlayerContext } from "./context";
import { getStrategy } from "./strategies";

export function createPlayerMachine(input: PlayerContext) {
  const strategy = getStrategy(input);

  return playerMachine.provide({
    guards: strategy.guards,
    actions: { playCard: assign(strategy.actions.playCard) },
  });
}
