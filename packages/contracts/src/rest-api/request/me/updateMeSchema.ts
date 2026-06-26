import { z } from "zod";
import { passwordSchema } from "../auth";

export const updateMeSchema = z
  .object({
    username: z.string().trim().min(3).max(30).optional(),
    email: z.string().trim().toLowerCase().pipe(z.email()).optional(),
    passwordOld: z.string().min(8).max(128).optional(),
    passwordNew: passwordSchema.optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field must be provided",
  })
  .refine(
    (data) =>
      (data.passwordOld && data.passwordNew) ||
      (!data.passwordOld && !data.passwordNew),
    {
      message: "Both current and new password must be provided",
    },
  )
  .refine(
    (data) =>
      !data.passwordOld ||
      !data.passwordNew ||
      data.passwordOld !== data.passwordNew,
    {
      path: ["passwordNew"],
      message: "New password must be different from current password",
    },
  );

export type UpdateMeRequestBody = z.infer<typeof updateMeSchema>;
