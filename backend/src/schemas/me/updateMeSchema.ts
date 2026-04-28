import { z } from "zod";

export const updateMeSchema = z
  .object({
    username: z.string().trim().min(3).max(30).optional(),
    email: z.string().trim().toLowerCase().pipe(z.email()).optional(),
    password: z.string().min(8).max(100).optional(),
    avatarUrl: z.union([z.string().trim().url().max(2048), z.null()]).optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    {
      message: "At least one field must be provided",
    }
  );

export type UpdateMeRequestBody = z.infer<typeof updateMeSchema>;