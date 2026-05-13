import { randomUUID } from "node:crypto";
import { CardInstance, CardType } from "../../types/card";

export const buildDeck = (size: number): CardInstance[] => {
  const cards: CardInstance[] = [];

  for (let i = 0; i < size; i++) {
    cards.push({
      instanceId: randomUUID(),
      definitionId: CardType.SKIP,
      type: CardType.SKIP
    });
  }
  return cards;
};
