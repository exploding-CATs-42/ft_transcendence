import { z } from "zod";
import { gameId } from "./ids.schema";

export const confirmStartSchema = z.object({
  gameId,
});

export type ConfirmStartParams = z.infer<typeof confirmStartSchema>;
