// Libraries
import { createActor } from "xstate";
import { describe, it, expect } from "vitest";
// Project level
import { gameMachine, GameStates, GameEvents } from "game";
import { Player } from "game/types";

const PLAYERS: Player[] = [
  {
    name: "player 1",
    id: "1",
    hand: [],
    isAlive: true,
    isConfirmed: false,
    turnOrder: 0,
  },
  {
    name: "player 2",
    id: "2",
    hand: [],
    isAlive: true,
    isConfirmed: false,
    turnOrder: 1,
  },
];

type Actor = ReturnType<typeof createActor<typeof gameMachine>>;

const addPlayers = (actor: Actor, players: Player[]) => {
  players.forEach((player) => {
    actor.send({ type: GameEvents.JOIN_GAME, player });
  });
};

const markAsReady = (actor: Actor, players: Player[]) => {
  players.forEach((player) => {
    actor.send({ type: GameEvents.CONFIRM_START, playerId: player.id });
  });
};

describe("game machine", () => {
  it("starts in waiting.confirming state", () => {
    const actor = createActor(gameMachine);

    actor.start();

    expect(actor.getSnapshot().value).toEqual({
      [GameStates.WAITING]: GameStates.WAITING_CONFIRMING,
    });
  });

  it("transitions to waiting.starting state when enough players confirmed their readiness", () => {
    const actor = createActor(gameMachine);

    console.log(PLAYERS);

    actor.start();
    addPlayers(actor, PLAYERS);
    markAsReady(actor, PLAYERS);

    expect(actor.getSnapshot().value).toEqual({
      [GameStates.WAITING]: GameStates.WAITING_STARTING,
    });
  });
});
