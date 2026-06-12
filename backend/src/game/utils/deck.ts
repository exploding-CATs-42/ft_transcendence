import type { CardDefinition, Deck } from "../types";
import rawCards from "../../constants/cards.json";
import { randomUUID } from "crypto";

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
