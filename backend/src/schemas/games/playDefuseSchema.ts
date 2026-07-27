import { z } from "zod";
import { gameId } from "./ids.schema";

export const playDefuseSchema = z.object({
  gameId,
});

export type PlayDefuseParams = z.infer<typeof playDefuseSchema>;
