import { z } from "zod";

export const getUserGamesParamsSchema = z.object({
  userId: z.string().uuid(),
});
