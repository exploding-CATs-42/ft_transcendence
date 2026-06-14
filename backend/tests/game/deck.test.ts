// Libraries
import { describe, it, expect } from "vitest";
// Project level
import { createDeck, dealInitialCards } from "game/utils";
import { CardType, Deck, Player } from "game/types";

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
    expect(deck.length).toBe(56);
  });
});

describe("dealInitialCards", () => {
  it("has to deal each of the players 7 regular cards and 1 defuse", () => {
    const initialDeck: Deck = createDeck();
    const players = [...PLAYERS];

    const newDeck = dealInitialCards(initialDeck, PLAYERS);

    const CARDS_DEALT = players.length * 8;
    const EXPLODING_KITTENS_INSERTED_BACK = players.length - 1;
    expect(newDeck.length).toBe(
      56 - CARDS_DEALT - 4 + EXPLODING_KITTENS_INSERTED_BACK,
    );
    players.forEach((player) => {
      expect(player.hand.length).toBe(8);
      expect(
        player.hand.some((card) => card.type === CardType.DEFUSE),
      ).toBeTruthy();
    });
  });
});
