import { z } from "zod";

export const getUserByIdParamsSchema = z.object({
  userId: z.string().uuid(),
});

export type GetUserByIdParams = z.infer<typeof getUserByIdParamsSchema>;
