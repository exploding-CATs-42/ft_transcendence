import { z } from "zod";
import { registerSchema } from "@exploding-cats/contracts";

export const registerFormSchema = registerSchema
  .extend({
    passwordConfirm: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Passwords do not match",
  });

export type RegisterFormSchema = z.infer<typeof registerFormSchema>;
