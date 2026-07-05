import { z } from "zod";
import { gameId } from "./ids.schema";

export const playCardSchema = z.object({
  gameId,
  cardId: z.coerce.number().min(0).max(55),
});

export type PLayCardParams = z.infer<typeof playCardSchema>;
