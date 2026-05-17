export class ApiError extends Error {
  public readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);

    this.details = details;

    this.name = new.target.name;
  }
}
