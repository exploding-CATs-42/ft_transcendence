import { z } from "zod";

export const deleteFriendshipSchema = z.object({
  userId: z.string().uuid(),
});
