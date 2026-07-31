import { CardType } from "@exploding-cats/game-core";
import { z } from "zod";
import { gameId } from "./ids.schema";

export const resolveComboSchema = z.object({
  gameId,
  targetPlayerId: z.uuid(),
  cardIndex: z.coerce.number().int().nonnegative().optional(),
  requestedCardType: z.enum(CardType).optional(),
});

export type ResolveComboParams = z.infer<typeof resolveComboSchema>;
