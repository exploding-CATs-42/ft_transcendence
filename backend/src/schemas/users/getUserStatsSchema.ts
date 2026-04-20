import { z } from "zod";

export const getUserStatsParamsSchema = z.object({
  userId: z.string().uuid(),
});

export type GetUserStatsParams = z.infer<typeof getUserStatsParamsSchema>;