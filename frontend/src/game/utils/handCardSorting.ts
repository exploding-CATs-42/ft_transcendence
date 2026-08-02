import { CardType, type Card } from "@exploding-cats/game-core";

const CARD_TYPE_PRIORITY: Record<CardType, number> = {
  [CardType.DEFUSE]: 0,
  [CardType.ATTACK]: 1,
  [CardType.SKIP]: 2,
  [CardType.FAVOR]: 3,
  [CardType.SHUFFLE]: 4,
  [CardType.SEE_THE_FUTURE]: 5,
  [CardType.NOPE]: 6,
  [CardType.TACOCAT]: 7,
  [CardType.HAIRY_POTATO_CAT]: 8,
  [CardType.BEARD_CAT]: 9,
  [CardType.CATTERMELON]: 10,
  [CardType.RAINBOW_RALPHING_CAT]: 11,
  [CardType.EXPLODING_KITTEN]: 12,
};

const getCardGroupPriority = (card: Card) => {
  if (card.type === CardType.DEFUSE) return 0;
  if (card.playable || card.playableOutOfTurn) return 1;
  return 2;
};

export const compareHandCards = (first: Card, second: Card) => {
  const groupDifference =
    getCardGroupPriority(first) - getCardGroupPriority(second);
  if (groupDifference !== 0) return groupDifference;

  const typeDifference =
    CARD_TYPE_PRIORITY[first.type] - CARD_TYPE_PRIORITY[second.type];
  if (typeDifference !== 0) return typeDifference;

  return first.id - second.id;
};

export const sortHandCards = (cards: Card[]) => {
  return [...cards].sort(compareHandCards);
};
