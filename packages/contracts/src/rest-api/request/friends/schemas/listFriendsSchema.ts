import { z } from "zod";

export const listFriendsQuerySchema = z.object({
  view: z.enum(["friends_and_requests", "accepted", "incoming"]).optional(),
});

export type ListFriendsQuery = z.infer<typeof listFriendsQuerySchema>;
