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
    iconTextureKey: Textures.hairyPotatoCat,
    label: "Hairy potato cat",
  },
  {
    iconTextureKey: Textures.beardCat,
    label: "Beard cat",
  },
  {
    iconTextureKey: Textures.cattermelon,
    label: "Cattermelon",
  },
  {
    iconTextureKey: Textures.tacocat,
    label: "Tacocat",
  },
  {
    iconTextureKey: Textures.rainbowRalphingCat,
    label: "Rainbow ralphing cat",
  },
  {
    iconTextureKey: Textures.attack,
    label: "Attack",
  },
  {
    iconTextureKey: Textures.defuse,
    label: "Defuse",
  },
  {
    iconTextureKey: Textures.favor,
    label: "Favor",
  },
  {
    iconTextureKey: Textures.nope,
    label: "Nope",
  },
  {
    iconTextureKey: Textures.seeTheFuture,
    label: "See the future",
  },
  {
    iconTextureKey: Textures.shuffle,
    label: "Shuffle",
  },
  {
    iconTextureKey: Textures.skip,
    label: "Skip",
  },
];
