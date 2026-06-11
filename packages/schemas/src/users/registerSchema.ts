import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long")
    .regex(/[A-Z]/, "It needs at least one uppercase letter")
    .regex(/[a-z]/, "It needs at least one lowercase letter")
    .regex(/[0-9]/, "It needs at least one number")
    .regex(/[^A-Za-z0-9]/, "It needs at least one special character"),
});

export type RegisterReqBody = z.infer<typeof registerSchema>;
