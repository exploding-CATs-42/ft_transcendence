import { z } from "zod";
import { gameId } from "./ids.schema";

export const reconnectGameSchema = z.object({
  gameId,
});

export type ReconnectGameParams = z.infer<typeof reconnectGameSchema>;
