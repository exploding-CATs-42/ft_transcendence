// Libraries
import { assign } from "xstate";
// Local level
import { GameEvents } from "./events";
import { GameAction, GameActionArgs } from "./types";
import { playerMachine } from "../Player";
import { gameSetup } from "./setup";
import { subscribeToPlayerEvents } from "./subscriptions";

export const GameActions = {
  ADD_PLAYER: "addPlayer",
} as const;

// export const addPlayer = assign(({ context, event, spawn }: GameActionArgs) => {
//   if (event.type !== GameEvents.JOIN_GAME) return context;

//   const playerId = event.player.id;

//   const player = spawn(playerMachine, {
//     id: `player-${playerId}`,
//   });

//   const updatedPlayers = new Map(context.players);
//   updatedPlayers.set(playerId, player);
//   return {
//     players: updatedPlayers,
//   };
// });

export const addPlayer = gameSetup.assign(({ context, event, spawn, self }) => {
  if (event.type !== GameEvents.JOIN_GAME) return {};

  const playerId = event.player.id;
  const player = spawn(playerMachine, { id: `player-${playerId}` });

  // `self` is now correctly typed as ActorRefFrom<typeof gameMachine>
  subscribeToPlayerEvents(player, self);

  const updatedPlayers = new Map(context.players);
  updatedPlayers.set(playerId, player);
  return { players: updatedPlayers };
});

export default {
  [GameActions.ADD_PLAYER]: addPlayer,
} satisfies Record<GameAction, unknown>;
