import { z } from "zod";
import { gameId } from "./ids.schema";

export const dropCardSchema = z.object({
  gameId,
  cardId: z.coerce.number().min(0).max(55),
});

export type DropCardParams = z.infer<typeof dropCardSchema>;
