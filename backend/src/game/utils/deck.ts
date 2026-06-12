// Libraries
import { randomUUID } from "crypto";
// Project level
import rawCards from "../../constants/cards.json";
// Local level
import type { CardDefinition, Deck } from "../types";

export const cardDefinitions = rawCards as CardDefinition[];

export const createDeck = (): Deck => {
  const deck: Deck = [];

  for (const definition of cardDefinitions) {
    const { count, ...cardData } = definition;
    for (let i = 0; i < count; i++) {
      deck.push({
        id: randomUUID(),
        ...cardData,
      });
    }
  }

  return deck;
};

// Fisher–Yates/Knuth shuffle
export const shuffleDeck = (deck: Deck): void => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
};
