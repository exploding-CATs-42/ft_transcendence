import { z } from "zod";
import { gameId } from "./ids.schema";

export const deleteGameParamsSchema = z
  .object({
    gameId
  })
  .strict();

export type DeleteGameParams = z.infer<typeof deleteGameParamsSchema>;
