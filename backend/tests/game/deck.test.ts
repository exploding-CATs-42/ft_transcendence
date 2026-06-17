// Libraries
import { describe, it, expect } from "vitest";
// Project level
import { createDeck, dealInitialCards } from "game/utils";
import { CardType, Deck, Player } from "game/types";
import { DEFAULT_GAME_RULES } from "game/constants";

const DECK_SIZE = 56;
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

describe("createDeck", () => {
  it("has to create a deck with 56 cards", () => {
    const deck: Deck = createDeck();
    expect(deck.length).toBe(DECK_SIZE);
  });
});

describe("dealInitialCards", () => {
  it("has to deal each of the players 7 regular cards and 1 defuse", () => {
    const initialDeck: Deck = createDeck();
    const players = [...PLAYERS];

    const newDeck = dealInitialCards(initialDeck, PLAYERS);

    const { dealtCardsPerPlayer, defusesDealtPerPlayer } = DEFAULT_GAME_RULES;
    const CARDS_DEALT_PER_PLAYER = dealtCardsPerPlayer + defusesDealtPerPlayer;
    const CARDS_DEALT = players.length * CARDS_DEALT_PER_PLAYER;
    const EXPLODING_KITTENS_INSERTED_BACK = players.length - 1;
    const ALL_EXPLODING_KITTENS = 4;
    const finalDeckSize =
      DECK_SIZE -
      CARDS_DEALT -
      ALL_EXPLODING_KITTENS +
      EXPLODING_KITTENS_INSERTED_BACK;

    expect(newDeck.length).toBe(finalDeckSize);
    players.forEach((player) => {
      expect(player.hand.length).toBe(CARDS_DEALT_PER_PLAYER);
      expect(
        player.hand.some((card) => card.type === CardType.DEFUSE),
      ).toBeTruthy();
    });
  });
});
