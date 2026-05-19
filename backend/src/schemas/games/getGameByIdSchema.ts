import { z } from "zod";
import { gameId } from "./ids.schema";

export const getGameByIdParamsSchema = z
  .object({
    gameId
  })
  .strict();

export type GetGameByIdParams = z.infer<typeof getGameByIdParamsSchema>;
