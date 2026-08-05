import { z } from "zod";
import { gameId } from "./ids.schema";

export const selectComboTargetSchema = z.object({
  gameId,
  targetPlayerId: z.uuid(),
});

export type SelectComboTargetParams = z.infer<typeof selectComboTargetSchema>;
