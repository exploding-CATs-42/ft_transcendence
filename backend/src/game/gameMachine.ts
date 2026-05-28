import { assign, setup } from "xstate";
import {
  addPlayer,
  markPlayerReady,
  markPlayerUnready,
  removePlayer,
} from "./actions";
import { Player } from "./types";
import { GameEvent } from "./events";
import { canEnterStarting } from "./guards";
import { START_GAME_COUNTDOWN_MS } from "../constants/game";

export interface GameContext {
  players: Player[];
}

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
  },
  actions: {
    addPlayer: assign(addPlayer),
    removePlayer: assign(removePlayer),
    markPlayerReady: assign(markPlayerReady),
    markPlayerUnready: assign(markPlayerUnready),
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
      initial: "readying",
      states: {
        readying: {
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
            MARK_READY: {
              actions: "markPlayerReady",
            },
            MARK_UNREADY: {
              actions: "markPlayerUnready",
            },
          },
        },
        starting: {
          after: {
            [START_GAME_COUNTDOWN_MS]: {
              target: "#game.playing",
            },
          },
          on: {
            JOIN_GAME: {
              target: "#game.waiting.readying",
              actions: "addPlayer",
            },
          },
        },
      },
    },
    playing: {},
  },
});
