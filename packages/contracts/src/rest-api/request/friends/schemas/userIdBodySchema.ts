import z from "zod";

export const userIdBodySchema = z.object({
  userId: z.string().uuid(),
});

export type UserIdBody = z.infer<typeof userIdBodySchema>;
