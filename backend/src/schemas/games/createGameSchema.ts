import { z } from "zod";
import { playerId } from "./ids.schema";

export const createGameSchema = z.object({
  playerId,
  gameName: z.string().trim().min(3).max(30),
  playersAmount: z.coerce.number().min(2).max(5)
});

export type CreateGameRequestBody = z.infer<typeof createGameSchema>;
