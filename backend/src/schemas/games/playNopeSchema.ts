import { z } from "zod";
import { gameId } from "./ids.schema";

export const playNopeSchema = z.object({
  gameId,
  cardId: z.coerce.number().min(0).max(55),
});

export type PlayNopeParams = z.infer<typeof playNopeSchema>;
