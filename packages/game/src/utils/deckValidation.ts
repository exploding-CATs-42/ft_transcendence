import type { Deck, GameRules } from "../types";
import { InsufficientCardsError } from "../errors";

export const validateDeckSizes = (
  mainDeck: Deck,
  defuses: Deck,
  explodingKittens: Deck,
  playersAmount: number,
  rules: GameRules,
): void => {
  const requiredMain = playersAmount * rules.dealtCardsPerPlayer;
  const requiredDefuses = playersAmount * rules.defusesDealtPerPlayer;
  const requiredKittens = playersAmount - 1;

  validateDeckSize(mainDeck, "mainDeck", requiredMain);
  validateDeckSize(defuses, "defuses", requiredDefuses);
  validateDeckSize(explodingKittens, "explodingKittens", requiredKittens);
};

const validateDeckSize = (
  deck: Deck,
  deckName: string,
  requiredAmount: number,
) => {
  if (deck.length < requiredAmount) {
    throw new InsufficientCardsError(deckName, requiredAmount, deck.length);
  }
};
