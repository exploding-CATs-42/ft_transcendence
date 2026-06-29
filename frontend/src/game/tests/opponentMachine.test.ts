// Libraries
import { describe, it, expect } from "vitest";
// Local level
import {
  createOpponentMachine,
  OpponentStates,
  OpponentEvents,
} from "../entities/model/Opponent";

describe("opponent machine", () => {
  it("starts in in-lobby, not-ready state", () => {
    const machine = createOpponentMachine();

    machine.start();

    expect(machine.getSnapshot().value).toEqual({
      [OpponentStates.IN_LOBBY]: OpponentStates.NOT_READY,
    });
  });

  it("transitions to in-lobby, ready state when it receives CONFIRM_READINESS event", () => {
    const machine = createOpponentMachine();

    machine.start();
    machine.send({ type: OpponentEvents.CONFIRM_READINESS });

    expect(machine.getSnapshot().value).toEqual({
      [OpponentStates.IN_LOBBY]: OpponentStates.READY,
    });
  });

  it("transitions to in-game, alive, waiting-for-turn state when it receives GAME_STARTED event", () => {
    const machine = createOpponentMachine();

    machine.start();
    machine.send({ type: OpponentEvents.CONFIRM_READINESS });
    machine.send({ type: OpponentEvents.GAME_STARTED });

    expect(machine.getSnapshot().value).toEqual({
      [OpponentStates.IN_GAME]: {
        [OpponentStates.ALIVE]: OpponentStates.WAITING_FOR_TURN,
      },
    });
  });

  it("transitions to in-game, alive, making-turn, normal state when it receives START_TURN event", () => {
    const machine = createOpponentMachine();

    machine.start();
    machine.send({ type: OpponentEvents.CONFIRM_READINESS });
    machine.send({ type: OpponentEvents.GAME_STARTED });
    machine.send({ type: OpponentEvents.START_TURN });

    expect(
      machine.getSnapshot().matches({
        [OpponentStates.IN_GAME]: {
          [OpponentStates.ALIVE]: OpponentStates.MAKING_TURN,
        },
      }),
    ).toBe(true);

    // expect(machine.getSnapshot().value).toEqual({
    //   [OpponentStates.IN_GAME]: {
    //     [OpponentStates.ALIVE]: {
    //       [OpponentStates.MAKING_TURN]: OpponentStates.NORMAL,
    //     },
    //   },
    // });
  });

  it("increases card count when it receives TAKE_CARD event", () => {
    const machine = createOpponentMachine();

    machine.start();
    machine.send({ type: OpponentEvents.CONFIRM_READINESS });
    machine.send({ type: OpponentEvents.GAME_STARTED });
    machine.send({ type: OpponentEvents.START_TURN });
    machine.send({ type: OpponentEvents.TAKE_CARD });

    const context = machine.getSnapshot().context;

    expect(context.cardCount).toEqual(1);
  });
});
