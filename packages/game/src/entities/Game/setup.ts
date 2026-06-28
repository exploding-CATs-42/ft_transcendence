// Libraries
import { assign, sendTo, setup } from "xstate";
// Local level
import { GameContext } from "./context";
import { GameEvent, GameEvents, GameOutEvent } from "./events";
import actions from "./actions";
import guards from "./guards";
import { PlayerEvents, playerMachine } from "../Player";

export const gameSetup = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
    emitted: {} as GameOutEvent,
  },
  actions: {
    ...actions,
    ["addPlayer"]: assign({
      players: ({ context, event, spawn }) => {
        if (event.type !== GameEvents.JOIN_GAME) return context.players;

        const { player } = event;
        const playerRef = spawn("playerMachine", {
          id: `player-${player.id}`,
          input: { playerId: player.id },
        });

        return { ...context.players, [player.id]: playerRef };
      },
    }),
    forwardReadinessToPlayer: sendTo(
      ({ context, event }) => {
        if (event.type !== GameEvents.PLAYER_CONFIRM_READINESS) throw Error;
        const player = context.players.get(event.playerId);
        if (!player) throw Error;
        return player;
      },
      { type: PlayerEvents.CONFIRM_READINESS },
    ),
  },
  guards: guards,
  actors: { playerMachine },
});
