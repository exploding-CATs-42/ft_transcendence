export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message);

    this.statusCode = statusCode;
    this.details = details;

    this.name = new.target.name;
  }
}
