import { z } from "zod";

export const createFriendRequestSchema = z.object({
  userId: z.string().uuid(),
});

export type CreateFriendRequestBody = z.infer<
  typeof createFriendRequestSchema
>;