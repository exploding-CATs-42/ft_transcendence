import { z } from "zod";

export const deleteFriendshipSchema = z.object({
  userId: z.string().uuid()
});

export type DeleteFriendshipBody = z.infer<typeof deleteFriendshipSchema>;
