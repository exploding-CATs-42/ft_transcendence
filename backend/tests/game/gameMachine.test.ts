// Libraries
import { createActor } from "xstate";
import { describe, it, expect } from "vitest";
// Project level
import { gameMachine, GameStates } from "game";

describe("game machine", () => {
  it("starts in waiting.confirming state", () => {
    const actor = createActor(gameMachine);

    actor.start();

    expect(actor.getSnapshot().value).toEqual({
      [GameStates.WAITING]: GameStates.WAITING_CONFIRMING,
    });
  });
});
