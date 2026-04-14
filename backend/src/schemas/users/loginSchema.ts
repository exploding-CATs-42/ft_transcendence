import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(8).max(100),
});

export type LoginRequestBody = z.infer<typeof loginSchema>;