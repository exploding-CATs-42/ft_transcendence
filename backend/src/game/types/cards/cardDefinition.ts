import { z } from "zod";
import { CardTypeSchema } from "./cardType";

export const CardDefinitionSchema = z.object({
  type: CardTypeSchema,
  name: z.string(),
  description: z.string(),
  count: z.number(),
  playable: z.boolean(),
  targetRequired: z.boolean(),
  comboEligible: z.boolean(),
  playableOutOfTurn: z.boolean(),
});

export type CardDefinition = z.infer<typeof CardDefinitionSchema>;
