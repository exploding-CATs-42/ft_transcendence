import { z } from "zod";
import { gameId } from "./ids.schema";

export const drawCardSchema = z.object({
  gameId,
});

export type DrawCardParams = z.infer<typeof drawCardSchema>;
