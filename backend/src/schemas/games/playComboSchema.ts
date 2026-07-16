import { z } from "zod";
import { gameId } from "./ids.schema";

export const playComboSchema = z.object({
  gameId,
  cardIds: z.array(z.coerce.number().int().nonnegative()).min(2).max(3),
});

export type PlayComboParams = z.infer<typeof playComboSchema>;
