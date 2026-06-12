import { z } from "zod";

export const CardTypeSchema = z.enum([
  "EXPLODING_KITTEN",
  "DEFUSE",
  "ATTACK",
  "SKIP",
  "FAVOR",
  "SHUFFLE",
  "SEE_THE_FUTURE",
  "NOPE",
  "TACOCAT",
  "HAIRY_POTATO_CAT",
  "BEARD_CAT",
  "CATTERMELON",
  "RAINBOW_RALPHING_CAT",
] as const);

export const CardType = CardTypeSchema.enum;
export type CardType = z.infer<typeof CardTypeSchema>;
