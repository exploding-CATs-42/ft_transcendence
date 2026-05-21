import { z } from "zod";
import { gameId } from "./ids.schema";

export const joinGameSchema = z.object({
  gameId,
});

export type JoinGameParams = z.infer<typeof joinGameSchema>;
