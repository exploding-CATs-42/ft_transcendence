import { CardType } from "@exploding-cats/game-core";
import type { CardOption } from "game/@types/CardOption";
import { Textures } from "./assets";

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
    iconTextureKey: Textures.hairyPotatoCat,
    label: "Hairy potato cat",
  },
  {
    type: CardType.BEARD_CAT,
    iconTextureKey: Textures.beardCat,
    label: "Beard cat",
  },
  {
    type: CardType.CATTERMELON,
    iconTextureKey: Textures.cattermelon,
    label: "Cattermelon",
  },
  {
    type: CardType.TACOCAT,
    iconTextureKey: Textures.tacocat,
    label: "Tacocat",
  },
  {
    type: CardType.RAINBOW_RALPHING_CAT,
    iconTextureKey: Textures.rainbowRalphingCat,
    label: "Rainbow ralphing cat",
  },
  {
    type: CardType.ATTACK,
    iconTextureKey: Textures.attack,
    label: "Attack",
  },
  {
    type: CardType.DEFUSE,
    iconTextureKey: Textures.defuse,
    label: "Defuse",
  },
  {
    type: CardType.FAVOR,
    iconTextureKey: Textures.favor,
    label: "Favor",
  },
  {
    type: CardType.NOPE,
    iconTextureKey: Textures.nope,
    label: "Nope",
  },
  {
    type: CardType.SEE_THE_FUTURE,
    iconTextureKey: Textures.seeTheFuture,
    label: "See the future",
  },
  {
    type: CardType.SHUFFLE,
    iconTextureKey: Textures.shuffle,
    label: "Shuffle",
  },
  {
    type: CardType.SKIP,
    iconTextureKey: Textures.skip,
    label: "Skip",
  },
];
