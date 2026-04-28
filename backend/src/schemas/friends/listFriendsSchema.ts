import { z } from "zod";

export const listFriendsQuerySchema = z.object({
  status: z.literal("incoming").optional(),
});

export type ListFriendsQuery = z.infer<typeof listFriendsQuerySchema>;