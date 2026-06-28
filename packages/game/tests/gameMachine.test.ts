// Libraries
import { createActor } from "xstate";
import { describe, it, expect, vi } from "vitest";
// Package level
import {
  gameMachine,
  GameStates,
  GameEvents,
  DEFAULT_GAME_RULES,
  START_GAME_COUNTDOWN_MS,
} from "../src";
import { CardType, Player } from "../src/types";

const DECK_SIZE = 56;
const PLAYERS: Player[] = [
  {
    name: "player 1",
    id: "1",
    avatarUrl: null,
    hand: [],
    isAlive: true,
    isConfirmed: false,
    turnOrder: 0,
  },
  {
    name: "player 2",
    id: "2",
    avatarUrl: null,
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
    actor.send({ type: GameEvents.CONFIRM_READINESS, playerId: player.id });
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

  it("transitions to playing.dealingCards state after 10 seconds from entering waiting.starting state", () => {
    vi.useFakeTimers();

    const actor = createActor(gameMachine);

    actor.start();
    addPlayers(actor, PLAYERS);
    markAsReady(actor, PLAYERS);

    vi.advanceTimersByTime(START_GAME_COUNTDOWN_MS);

    expect(actor.getSnapshot().value).toEqual({
      [GameStates.PLAYING]: GameStates.DEALING_CARDS,
    });

    vi.useRealTimers();
  });

  it("has a deck with 37 cards in it, after entering playing.dealingCards state", () => {
    vi.useFakeTimers();

    const actor = createActor(gameMachine);

    actor.start();
    addPlayers(actor, PLAYERS);
    markAsReady(actor, PLAYERS);

    vi.advanceTimersByTime(START_GAME_COUNTDOWN_MS);

    const snapshot = actor.getSnapshot();
    const deck = snapshot.context.deck;
    const players = snapshot.context.players;

    const { dealtCardsPerPlayer } = DEFAULT_GAME_RULES;
    const REGULAR_CARDS_DEALT = players.length * dealtCardsPerPlayer;
    const ALL_EXPLODING_KITTENS = 4;
    const ALL_DEFUSES = 6;
    const EXPLODING_KITTENS_INSERTED_BACK = players.length - 1;
    const DEFUSES_INSERTED_BACK = players.length < 5 ? 2 : 1;
    // prettier-ignore
    const finalDeckSize =
      DECK_SIZE
        - REGULAR_CARDS_DEALT
        - ALL_EXPLODING_KITTENS
        - ALL_DEFUSES
        + EXPLODING_KITTENS_INSERTED_BACK
        + DEFUSES_INSERTED_BACK;

    expect(deck.length).toBe(finalDeckSize);
  });

  it("deals 8 cards to each of the players, after entering playing.dealingCards state, \
    one of which is a defuse", () => {
    // Arrange
    vi.useFakeTimers();
    const actor = createActor(gameMachine);

    // Act
    actor.start();
    addPlayers(actor, PLAYERS);
    markAsReady(actor, PLAYERS);
    vi.advanceTimersByTime(START_GAME_COUNTDOWN_MS);

    // Assert
    const snapshot = actor.getSnapshot();
    const players = snapshot.context.players;

    const { dealtCardsPerPlayer, defusesDealtPerPlayer } = DEFAULT_GAME_RULES;
    const CARDS_DEALT_PER_PLAYER = dealtCardsPerPlayer + defusesDealtPerPlayer;

    players.forEach((player) => {
      expect(player.hand.length).toBe(CARDS_DEALT_PER_PLAYER);
      expect(
        player.hand.some((card) => card.type === CardType.DEFUSE),
      ).toBeTruthy();
    });
  });
});
