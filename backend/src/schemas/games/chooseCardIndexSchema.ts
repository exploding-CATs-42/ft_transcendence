import { z } from "zod";
import { gameId } from "./ids.schema";

export const chooseCardIndexSchema = z.object({
  gameId,
  cardIndex: z.coerce.number().min(0).max(55),
});

export type ChooseCardIndexPayload = z.infer<typeof chooseCardIndexSchema>;
