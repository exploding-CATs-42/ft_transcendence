import { z } from "zod";
import { gameId } from "./ids.schema";

export const getGameParamsSchema = z
  .object({
    gameId,
  })
  .strict();

export type GetGameParams = z.infer<typeof getGameParamsSchema>;
