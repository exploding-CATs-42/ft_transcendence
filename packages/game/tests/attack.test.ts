import { describe, expect, it } from "vitest";
import {
  CardType,
  GameEvents,
  GameOutEvents,
  changeTurn,
  playCard,
  turnChanged,
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
  lastPlayedCard: null,
  countdownEndsAt: null,
  turnsCount: 1,
  isUnderAttack: false,
  ...overrides,
});

const applyAttack = (context: GameContext): GameContext => {
  const contextAfterPlaying = {
    ...context,
    ...playCard({ context, event: ATTACK_EVENT }),
  };

  return {
    ...contextAfterPlaying,
    ...changeTurn({
      context: contextAfterPlaying,
      event: ATTACK_EVENT,
    }),
  };
};

describe("Attack card", () => {
  it("ends the turn without drawing and gives the next player 2 draws", () => {
    const context = createContext();
    const deckBeforeAttack = [...context.deck];

    const result = applyAttack(context);

    expect(result.currentTurnPlayerId).toBe("2");
    expect(result.turnsCount).toBe(2);
    expect(result.isUnderAttack).toBe(true);
    expect(result.deck).toEqual(deckBeforeAttack);
    expect(result.players[0]?.hand).not.toContainEqual(ATTACK_CARD);
    expect(result.lastPlayedCard).toEqual(ATTACK_CARD);
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
});
