import { z } from "zod";

export const updateFriendshipParamsSchema = z.object({
  userId: z.string().uuid(),
});

export const updateFriendshipBodySchema = z.object({
  action: z.enum(["accept", "reject"]),
});

export type UpdateFriendshipParams = z.infer<
  typeof updateFriendshipParamsSchema
>;

export type UpdateFriendshipBody = z.infer<typeof updateFriendshipBodySchema>;