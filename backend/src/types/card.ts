export enum CardType {
  EXPLODING_KITTEN = "EXPLODING_KITTEN",
  DEFUSE = "DEFUSE",
  ATTACK = "ATTACK",
  SKIP = "SKIP",
  FAVOR = "FAVOR",
  SHUFFLE = "SHUFFLE",
  SEE_THE_FUTURE = "SEE_THE_FUTURE",
  NOPE = "NOPE",
  TACOCAT = "TACOCAT",
  HAIRY_POTATO_CAT = "HAIRY_POTATO_CAT",
  BEARD_CAT = "BEARD_CAT",
  CATTERMELON = "CATTERMELON",
  RAINBOW_RALPHING_CAT = "RAINBOW_RALPHING_CAT"
}

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

export interface CardInstance {
  instanceId: string;
  definitionId: string;
  type: CardType;
}
