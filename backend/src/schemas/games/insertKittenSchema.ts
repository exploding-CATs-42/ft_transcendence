import { z } from "zod";
import { gameId } from "./ids.schema";

export const insertKittenSchema = z.object({
  gameId,
  explodingKittenPosition: z.coerce.number().min(0).max(55),
});

export type InsertKittenParams = z.infer<typeof insertKittenSchema>;
