import { z } from "zod";

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const avatarSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_SIZE, {
    message: "Max file size is 2MB",
  })
  .refine((file) => ALLOWED_TYPES.includes(file.type), {
    message: "Only JPG, PNG and WEBP are allowed",
  });

export type Avatar = z.infer<typeof avatarSchema>;
