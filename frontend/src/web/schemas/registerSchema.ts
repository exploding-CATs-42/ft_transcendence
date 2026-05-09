import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.email("Invalid email address"),

    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters"),

    password: z
      .string()
      .min(6, "Password must be at least 12 characters")
      .max(128, "Password is too long")
      .regex(/[A-Z]/, "It needs at least one uppercase letter")
      .regex(/[a-z]/, "It needs at least one lowercase letter")
      .regex(/[0-9]/, "It needs at least one number")
      .regex(/[^A-Za-z0-9]/, "It needs at least one special character"),

    passwordConfirm: z.string().min(1, "Please confirm your password")
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Passwords do not match"
  });

export type RegisterSchema = z.infer<typeof registerSchema>;
