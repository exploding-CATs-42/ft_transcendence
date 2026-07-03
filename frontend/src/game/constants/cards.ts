import { CardType } from "@exploding-cats/game-core";
import type { CardOption } from "game/@types/CardOption";

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

export const CARD_OPTIONS: CardOption[] = [
  {
    type: CardType.HAIRY_POTATO_CAT,
    iconFrameIndex: 5,
    label: "Hairy potato cat",
  },
  {
    type: CardType.BEARD_CAT,
    iconFrameIndex: 1,
    label: "Beard cat",
  },
  {
    type: CardType.CATTERMELON,
    iconFrameIndex: 2,
    label: "Cattermelon",
  },
  {
    type: CardType.TACOCAT,
    iconFrameIndex: 11,
    label: "Tacocat",
  },
  {
    type: CardType.RAINBOW_RALPHING_CAT,
    iconFrameIndex: 7,
    label: "Rainbow ralphing cat",
  },
  {
    type: CardType.ATTACK,
    iconFrameIndex: 0,
    label: "Attack",
  },
  {
    type: CardType.DEFUSE,
    iconFrameIndex: 3,
    label: "Defuse",
  },
  {
    type: CardType.FAVOR,
    iconFrameIndex: 4,
    label: "Favor",
  },
  {
    type: CardType.NOPE,
    iconFrameIndex: 6,
    label: "Nope",
  },
  {
    type: CardType.SEE_THE_FUTURE,
    iconFrameIndex: 8,
    label: "See the future",
  },
  {
    type: CardType.SHUFFLE,
    iconFrameIndex: 9,
    label: "Shuffle",
  },
  {
    type: CardType.SKIP,
    iconFrameIndex: 10,
    label: "Skip",
  },
];
