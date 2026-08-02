import { CardType, type Card } from "@exploding-cats/game-core";
import { describe, expect, it } from "vitest";
import { sortHandCards } from "./handCardSorting";

const createCard = (
  id: number,
  type: CardType,
  playable = false,
  playableOutOfTurn = false,
): Card => ({
  id,
  type,
  name: type,
  description: "",
  playable,
  targetRequired: false,
  comboEligible: true,
  playableOutOfTurn,
});

describe("sortHandCards", () => {
  it("orders defuses, active cards, and remaining cards by type", () => {
    const cards = [
      createCard(8, CardType.TACOCAT),
      createCard(6, CardType.ATTACK, true),
      createCard(9, CardType.DEFUSE),
      createCard(4, CardType.NOPE, false, true),
      createCard(7, CardType.EXPLODING_KITTEN),
      createCard(3, CardType.SKIP, true),
      createCard(2, CardType.ATTACK, true),
    ];

    const sortedCards = sortHandCards(cards);

    expect(sortedCards.map(({ type }) => type)).toEqual([
      CardType.DEFUSE,
      CardType.ATTACK,
      CardType.ATTACK,
      CardType.SKIP,
      CardType.NOPE,
      CardType.TACOCAT,
      CardType.EXPLODING_KITTEN,
    ]);
    expect(sortedCards.map(({ id }) => id)).toEqual([9, 2, 6, 3, 4, 8, 7]);
  });

  it("does not change the original hand", () => {
    const cards = [
      createCard(1, CardType.TACOCAT),
      createCard(2, CardType.DEFUSE),
    ];

    sortHandCards(cards);

    expect(cards.map(({ id }) => id)).toEqual([1, 2]);
  });
});
