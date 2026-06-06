import { ApiError } from "./apiError";

export class ValidationError extends ApiError {
  constructor(errors: unknown) {
    super("Validation error", 400, errors);
  }
}
