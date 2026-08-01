import { z } from "zod";
import { gameId } from "./ids.schema";

export const seenTheFutureSchema = z.object({
  gameId,
});

export type SeenTheFuturePayload = z.infer<typeof seenTheFutureSchema>;
