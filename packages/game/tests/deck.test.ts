// Libraries
import { describe, it, expect } from "vitest";
// Package level
import {
  createDeck,
  dealInitialCards,
  countKittensInDeck,
  drawOneCard,
  DEFAULT_GAME_RULES,
} from "../src";
import { CardType, Deck, Player } from "../src/types";

const DECK_SIZE = 56;
const PLAYERS: Player[] = [
  {
    name: "player 1",
    id: "1",
    avatarUrl: null,
    hand: [],
    isAlive: true,
    isConfirmed: false,
  },
  {
    name: "player 2",
    id: "2",
    avatarUrl: null,
    hand: [],
    isAlive: true,
    isConfirmed: false,
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
    const REGULAR_CARDS_DEALT = players.length * dealtCardsPerPlayer;
    const CARDS_DEALT_PER_PLAYER = dealtCardsPerPlayer + defusesDealtPerPlayer;
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

    expect(newDeck.length).toBe(finalDeckSize);
    players.forEach((player) => {
      expect(player.hand.length).toBe(CARDS_DEALT_PER_PLAYER);
      expect(
        player.hand.some((card) => card.type === CardType.DEFUSE),
      ).toBeTruthy();
    });
  });
});

describe("countKittensInDeck", () => {
  const makePlayers = (amount: number): Player[] =>
    Array.from({ length: amount }, (_, i) => ({
      name: `player ${i + 1}`,
      id: `${i + 1}`,
      avatarUrl: null,
      hand: [],
      isAlive: true,
      isConfirmed: false,
    }));

  it("counts one kitten less than the players a game was dealt for", () => {
    const players = makePlayers(4);
    const deck = dealInitialCards(createDeck(), players);

    expect(countKittensInDeck(deck)).toBe(players.length - 1);
  });

  it("drops the count when a kitten is drawn and restores it on reinsertion", () => {
    const players = makePlayers(4);
    const deck = dealInitialCards(createDeck(), players);
    const kittensBefore = countKittensInDeck(deck);

    // Pull cards until a kitten comes off the top
    let drawn = drawOneCard(deck);
    while (drawn && drawn.type !== CardType.EXPLODING_KITTEN) {
      drawn = drawOneCard(deck);
    }

    expect(drawn?.type).toBe(CardType.EXPLODING_KITTEN);
    expect(countKittensInDeck(deck)).toBe(kittensBefore - 1);

    deck.splice(3, 0, drawn!);
    expect(countKittensInDeck(deck)).toBe(kittensBefore);
  });

  it("is unaffected by a player leaving, unlike the player count", () => {
    const players = makePlayers(4);
    const deck = dealInitialCards(createDeck(), players);

    players.pop();

    expect(countKittensInDeck(deck)).toBe(3);
    expect(countKittensInDeck(deck)).not.toBe(players.length - 1);
  });
});
