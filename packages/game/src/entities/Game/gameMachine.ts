// Libraries
import { assign, emit, sendTo } from "xstate";
// Local level
import { GAME_MACHINE_ID, START_GAME_COUNTDOWN_MS } from "./constants";
import { GameActions } from "./actions";
import { GameEvents } from "./events";
import { GameGuards } from "./guards";
import { GameStates } from "./states";
import { GameTargets } from "./targets";
import { countdownCanceled, countdownStarted } from "./emitters";
import { gameSetup } from "./setup";
import { playerMachine } from "../Player";
import { subscribeToPlayerEvents } from "./subscriptions";

export const gameMachine = gameSetup.createMachine({
  id: GAME_MACHINE_ID,
  context: () => ({
    players: new Map(),
    deck: [],
  }),
  initial: GameStates.WAITING,
  states: {
    [GameStates.WAITING]: {
      initial: GameStates.WAITING_CONFIRMING,
      states: {
        [GameStates.WAITING_CONFIRMING]: {
          always: {
            guard: GameGuards.HAS_ENOUGH_PLAYERS,
            target: GameTargets.WAITING_STARTING,
          },
          on: {
            [GameEvents.JOIN_GAME]: {
              actions: assign(({ context, event, spawn, self }) => {
                // Create the dynamic child actor
                const player = spawn(playerMachine);

                subscribeToPlayerEvents(player, self);
                const players = new Map(context.players);
                players.set(event.player.id, player);

                return {
                  players,
                };
              }),
            },
          },
        },
        [GameStates.WAITING_STARTING]: {
          entry: emit(countdownStarted),
          after: {
            [START_GAME_COUNTDOWN_MS]: {
              target: GameTargets.PLAYING,
            },
          },
          on: {
            [GameEvents.JOIN_GAME]: {
              actions: [GameActions.ADD_PLAYER, emit(countdownCanceled)],
              target: GameTargets.WAITING_CONFIRMING,
            },
          },
        },
      },
    },
    [GameStates.PLAYING]: {},
  },
});
