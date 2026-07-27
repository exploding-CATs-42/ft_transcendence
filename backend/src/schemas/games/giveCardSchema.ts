import { z } from "zod";
import { gameId } from "./ids.schema";

export const giveCardSchema = z.object({
  gameId,
  playerIdFrom: z.uuid(),
  playerIdTo: z.uuid(),
  cardId: z.coerce.number().min(0).max(55),
});

export type GiveCardPayload = z.infer<typeof giveCardSchema>;
