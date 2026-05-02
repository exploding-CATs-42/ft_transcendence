import { z } from "zod";
import { gameId, playerId } from "./ids.schema";

export const joinGameBodySchema = z.object({
  playerId
});

export const joinGameParamsSchema = z.object({
  gameId
});

export type JoinGameParams = z.infer<typeof joinGameParamsSchema>;
export type JoinGameBody = z.infer<typeof joinGameBodySchema>;
