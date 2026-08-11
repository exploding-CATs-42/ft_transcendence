import { z } from "zod";

export const getUserByIdParamsSchema = z.object({
  userId: z.string().uuid(),
});
