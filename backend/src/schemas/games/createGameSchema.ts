import { z } from "zod";

export const createGameSchema = z.object({
  gameName: z.string().trim().min(3).max(30),
  playersAmount: z.coerce.number().min(2).max(5)
});

export type CreateGameRequestBody = z.infer<typeof createGameSchema>;
