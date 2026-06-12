export const CardType = {
  EXPLODING_KITTEN: "EXPLODING_KITTEN",
  DEFUSE: "DEFUSE",
  ATTACK: "ATTACK",
  SKIP: "SKIP",
  FAVOR: "FAVOR",
  SHUFFLE: "SHUFFLE",
  SEE_THE_FUTURE: "SEE_THE_FUTURE",
  NOPE: "NOPE",
  TACOCAT: "TACOCAT",
  HAIRY_POTATO_CAT: "HAIRY_POTATO_CAT",
  BEARD_CAT: "BEARD_CAT",
  CATTERMELON: "CATTERMELON",
  RAINBOW_RALPHING_CAT: "RAINBOW_RALPHING_CAT",
} as const;

export type CardType = (typeof CardType)[keyof typeof CardType];

export interface CardDefinition {
  type: CardType;
  name: string;
  description: string;
  count: number;
  playable: boolean;
  targetRequired: boolean;
  comboEligible: boolean;
  playableOutOfTurn: boolean;
}

interface CardInstance {
  id: string;
}

export type Card = Omit<CardDefinition, "count"> & CardInstance;

export interface Deck {
  drawPile: CardInstance[];
  discardPile: CardInstance[];
}
