import { CardType } from "@exploding-cats/game-core";

export const CARD_TYPE_TO_FRAME: Record<CardType, number> = {
  [CardType.EXPLODING_KITTEN]: 0,
  [CardType.HAIRY_POTATO_CAT]: 4,
  [CardType.BEARD_CAT]: 5,
  [CardType.CATTERMELON]: 6,
  [CardType.TACOCAT]: 7,
  [CardType.RAINBOW_RALPHING_CAT]: 8,
  [CardType.ATTACK]: 9,
  [CardType.DEFUSE]: 13,
  [CardType.FAVOR]: 19,
  [CardType.NOPE]: 23,
  [CardType.SEE_THE_FUTURE]: 28,
  [CardType.SHUFFLE]: 33,
  [CardType.SKIP]: 37,
};
