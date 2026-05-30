import { assign, emit, setup } from "xstate";
import {
  addPlayer,
  addPlayerConfirmation,
  removePlayer,
  removePlayerConfirmation,
} from "./actions";
import { Player } from "./types";
import { GameEvent } from "./events";
import { canEnterStarting } from "./guards";
import { START_GAME_COUNTDOWN_MS } from "../constants/game";
import { GameEmitter } from "./emitters";

export interface GameContext {
  players: Player[];
}

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
    emitted: {} as GameEmitter,
  },
  actions: {
    addPlayer: assign(addPlayer),
    removePlayer: assign(removePlayer),
    addPlayerConfirmation: assign(addPlayerConfirmation),
    removePlayerConfirmation: assign(removePlayerConfirmation),
  },
  guards: {
    canEnterStarting,
  },
}).createMachine({
  id: "game",
  initial: "waiting",
  context: () => ({
    players: [],
  }),
  states: {
    waiting: {
      initial: "confirming",
      states: {
        confirming: {
          always: {
            guard: "canEnterStarting",
            target: "starting",
          },
          on: {
            JOIN_GAME: {
              actions: "addPlayer",
            },
            LEAVE_GAME: {
              actions: "removePlayer",
            },
            CONFIRM_START: {
              actions: "addPlayerConfirmation",
            },
            CANCEL_START: {
              actions: "removePlayerConfirmation",
            },
          },
        },
        starting: {
          entry: emit(() => ({
            type: "COUNTDOWN_STARTED",
            endsAt: Date.now() + START_GAME_COUNTDOWN_MS,
          })),
          after: {
            [START_GAME_COUNTDOWN_MS]: {
              target: "#game.playing",
            },
          },
          on: {
            JOIN_GAME: {
              target: "#game.waiting.confirming",
              actions: ["addPlayer", emit({ type: "COUNTDOWN_CANCELED" })],
            },
            LEAVE_GAME: {
              target: "#game.waiting.confirming",
              actions: ["removePlayer", emit({ type: "COUNTDOWN_CANCELED" })],
            },
            CANCEL_START: {
              target: "#game.waiting.confirming",
              actions: [
                "removePlayerConfirmation",
                emit({ type: "COUNTDOWN_CANCELED" }),
              ],
            },
          },
        },
      },
    },
    playing: {},
  },
});
