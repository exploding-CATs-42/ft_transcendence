import { z } from "zod";
import { passwordSchema } from "./passwordSchema";

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters"),
  password: passwordSchema,
});

export type RegisterRequestBody = z.infer<typeof registerSchema>;
