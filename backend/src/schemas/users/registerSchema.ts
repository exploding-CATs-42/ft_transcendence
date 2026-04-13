import { z } from "zod";

export const registerSchema = z.object({
  email: z.email().trim().toLowerCase(),
  username: z.string().trim().min(3).max(30),
  password: z.string().min(8).max(100),
});

export type RegisterRequestBody = z.infer<typeof registerSchema>;