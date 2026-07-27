import { z } from "zod";
import { gameId } from "./ids.schema";

export const insertKittenSchema = z.object({
  gameId,
  explodingKittenPosition: z.coerce.number().int().min(0),
});

export type InsertKittenParams = z.infer<typeof insertKittenSchema>;
