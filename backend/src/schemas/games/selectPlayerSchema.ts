import { z } from "zod";
import { gameId } from "./ids.schema";

export const selectPlayerSchema = z.object({
  gameId,
  playerId: z.uuid(),
});

export type SelectPlayerPayload = z.infer<typeof selectPlayerSchema>;
