import { z } from "zod";
import { gameId } from "./ids.schema";

export const cancelStartSchema = z.object({
  gameId,
});

export type CancelStartParams = z.infer<typeof cancelStartSchema>;
