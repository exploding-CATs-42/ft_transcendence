import { createActor } from "xstate";
import { describe, expect, it, vi } from "vitest";
import {
  CardType,
  GameEvents,
  GameOutEvents,
  GameStates,
  NOPE_WINDOW_MS,
  changeTurn,
  changeTurnUnderAttack,
  gameMachine,
  playCard,
  skipTurn,
  turnChanged,
  turnSkipped,
  type Card,
  type GameContext,
  type Player,
} from "../src";

const ATTACK_CARD: Card = {
  id: 100,
  type: CardType.ATTACK,
  name: "Attack",
  description: "Attack test card",
  playable: true,
  targetRequired: false,
  comboEligible: true,
  playableOutOfTurn: false,
};

const DRAW_PILE_CARD: Card = {
  id: 101,
  type: CardType.SHUFFLE,
  name: "Shuffle",
  description: "Draw pile test card",
  playable: true,
  targetRequired: false,
  comboEligible: true,
  playableOutOfTurn: false,
};

const PLAYERS: Player[] = [
  {
    id: "1",
    name: "player 1",
    avatarUrl: null,
    hand: [ATTACK_CARD],
    isConfirmed: true,
    isAlive: true,
  },
  {
    id: "2",
    name: "player 2",
    avatarUrl: null,
    hand: [],
    isConfirmed: true,
    isAlive: true,
  },
];

const ATTACK_EVENT = {
  type: GameEvents.PLAY_CARD,
  playerId: "1",
  card: ATTACK_CARD,
} as const;

const createContext = (overrides: Partial<GameContext> = {}): GameContext => ({
  players: PLAYERS.map((player) => ({
    ...player,
    hand: [...player.hand],
  })),
  deck: [DRAW_PILE_CARD],
  currentTurnPlayerId: "1",
  lastDrawnCard: null,
  lastPlayedCards: null,
  countdownEndsAt: null,
  turnsCount: 1,
  isUnderAttack: false,
  nopeWindow: null,
  ...overrides,
});

const applyAttack = (context: GameContext): GameContext => {
  const contextAfterPlaying = {
    ...context,
    ...playCard({ context, event: ATTACK_EVENT }),
  };

  return {
    ...contextAfterPlaying,
    ...changeTurnUnderAttack({
      context: contextAfterPlaying,
      event: ATTACK_EVENT,
    }),
  };
};

describe("Attack card", () => {
  it("applies the effect after the Nope window resolves", () => {
    vi.useFakeTimers();

    const snapshot = gameMachine.resolveState({
      value: {
        [GameStates.PLAYING]: GameStates.WAITING_FOR_PLAYER_ACTIONS,
      },
      context: createContext(),
    });
    const actor = createActor(gameMachine, { snapshot });
    let emittedAttackCount: number | null = null;

    actor.on(GameOutEvents.TURN_CHANGED, (event) => {
      emittedAttackCount = event.payload.attackCount;
    });

    try {
      actor.start();
      actor.send(ATTACK_EVENT);
      vi.advanceTimersByTime(NOPE_WINDOW_MS);

      const context = actor.getSnapshot().context;

      expect(context.currentTurnPlayerId).toBe("2");
      expect(context.turnsCount).toBe(2);
      expect(context.isUnderAttack).toBe(true);
      expect(context.nopeWindow).toBeNull();
      expect(emittedAttackCount).toBe(2);
    } finally {
      actor.stop();
      vi.useRealTimers();
    }
  });

  it("ends the turn without drawing and gives the next player 2 draws", () => {
    const context = createContext();
    const deckBeforeAttack = [...context.deck];

    const result = applyAttack(context);

    expect(result.currentTurnPlayerId).toBe("2");
    expect(result.turnsCount).toBe(2);
    expect(result.isUnderAttack).toBe(true);
    expect(result.deck).toEqual(deckBeforeAttack);
    expect(result.players[0]?.hand).not.toContainEqual(ATTACK_CARD);
    expect(result.lastPlayedCards).toEqual([ATTACK_CARD]);
  });

  it("stacks 2 additional draws onto 2 remaining draws", () => {
    const context = createContext({
      turnsCount: 2,
      isUnderAttack: true,
    });

    const result = applyAttack(context);

    expect(result.currentTurnPlayerId).toBe("2");
    expect(result.turnsCount).toBe(4);
    expect(result.isUnderAttack).toBe(true);
  });

  it("stacks 2 additional draws after one owed draw was completed", () => {
    const context = createContext({
      turnsCount: 1,
      isUnderAttack: true,
    });

    const result = applyAttack(context);

    expect(result.currentTurnPlayerId).toBe("2");
    expect(result.turnsCount).toBe(3);
    expect(result.isUnderAttack).toBe(true);
  });

  it("resets the attack state after a normal turn change", () => {
    const context = createContext({
      turnsCount: 0,
      isUnderAttack: true,
    });

    const result = changeTurn({
      context,
      event: {
        type: GameEvents.DRAW_CARD,
        playerId: "1",
      },
    });

    expect(result).toMatchObject({
      currentTurnPlayerId: "2",
      turnsCount: 1,
      isUnderAttack: false,
    });
  });

  it("includes the number of owed draws in TURN_CHANGED", () => {
    const context = createContext({
      currentTurnPlayerId: "2",
      turnsCount: 4,
      isUnderAttack: true,
    });

    const event = turnChanged({
      context,
      event: ATTACK_EVENT,
    });

    expect(event).toEqual({
      type: GameOutEvents.TURN_CHANGED,
      payload: {
        playerId: "2",
        attackCount: 4,
      },
    });
  });

  it("reduces the remaining attack count after Skip", () => {
    const context = createContext({
      turnsCount: 2,
      isUnderAttack: true,
    });

    const result = {
      ...context,
      ...skipTurn({
        context,
        event: ATTACK_EVENT,
      }),
    };

    expect(result.currentTurnPlayerId).toBe("1");
    expect(result.turnsCount).toBe(1);
    expect(result.isUnderAttack).toBe(true);

    expect(
      turnSkipped({
        context: result,
        event: ATTACK_EVENT,
      }),
    ).toEqual({
      type: GameOutEvents.TURN_SKIPPED,
      payload: {
        playerId: "1",
        attackCount: 1,
      },
    });
  });
});
