import { z } from "zod";

export const joinGameSchema = z.object({
  gameId: z.string(),
});

export type JoinGameSchema = z.infer<typeof joinGameSchema>;
