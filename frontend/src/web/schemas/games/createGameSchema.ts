import { z } from "zod";

export const createGameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter a table name")
    .min(3, "Table name must be at least 3 characters")
    .max(30, "Table name must be at most 30 characters"),
  maxPlayers: z.number(),
});

export type CreateGameSchema = z.infer<typeof createGameSchema>;
