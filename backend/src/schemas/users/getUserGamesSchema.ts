import { z } from "zod";

export const getUserGamesParamsSchema = z.object({
  userId: z.string().uuid()
});

export type GetUserGamesParams = z.infer<typeof getUserGamesParamsSchema>;
