import { z } from "zod";
import { gameId } from "./ids.schema";

export const chooseCardIdSchema = z.object({
  gameId,
  cardId: z.coerce.number().min(0).max(55),
});

export type ChooseCardIdPayload = z.infer<typeof chooseCardIdSchema>;
