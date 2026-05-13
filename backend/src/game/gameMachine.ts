import { assign, setup } from "xstate";
import { buildDeck } from "./utils/deck";
import { dealCards, drawTopCard, rotateTurn } from "./actions";
import { isCurrentPlayer } from "./guards";
import { GameContext, MachineEvent, MachineInput } from "./types";

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as MachineEvent,
    input: {} as MachineInput
  },
  guards: { isCurrentPlayer },
  actions: {
    dealCards: assign(dealCards),
    drawTopCard: assign(drawTopCard),
    rotateTurn: assign(rotateTurn)
  }
}).createMachine({
  id: "game",
  initial: "gameStarting",
  context: ({ input }) => ({
    players: input.players.map((p) => ({
      playerId: p.playerId,
      displayName: p.displayName,
      hand: []
    })),
    currentPlayerIndex: 0,
    deck: buildDeck(input.deckSize),
    turnNumber: 1,
    cardsPerPlayer: input.cardsPerPlayer
  }),
  states: {
    gameStarting: {
      always: "dealing"
    },
    dealing: {
      entry: "dealCards",
      always: "awaitingDraw"
    },
    awaitingDraw: {
      on: {
        DRAW_CARD: {
          guard: "isCurrentPlayer",
          target: "awaitingDraw",
          actions: ["drawTopCard", "rotateTurn"],
          reenter: true
        }
      }
    }
  }
});
