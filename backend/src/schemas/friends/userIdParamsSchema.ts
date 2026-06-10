import z from "zod";

export const userIdParamsSchema = z.object({
  userId: z.string().uuid(),
});

export type UserIdParams = z.infer<typeof userIdParamsSchema>;
