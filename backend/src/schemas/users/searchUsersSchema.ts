import { z } from "zod";

export const searchUsersQuerySchema = z.object({
  username: z.string().trim().min(3).max(20),
});
