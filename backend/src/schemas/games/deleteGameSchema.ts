import { z } from "zod";
import { gameId } from "./ids.schema";

export const deleteGameParamsSchema = z.object({
  gameId
});

export type DeleteGameParams = z.infer<typeof deleteGameParamsSchema>;
