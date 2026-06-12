import { ZodSchema } from "zod";
import { ValidationError } from "../errors";

export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  const parsed = schema.safeParse(data);

  console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!! ${JSON.stringify(data)}`);

  if (!parsed.success) {
    throw new ValidationError(parsed.error.flatten());
  }
  return parsed.data;
}
