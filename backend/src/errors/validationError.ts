import { ApiError } from "./apiError";

export class ValidationError extends ApiError {
  constructor(details: unknown) {
    super("Validation error", 400, details);
  }
}
