export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors?: unknown;

  constructor(message: string, statusCode = 400, errors?: unknown) {
    super(message);

    this.statusCode = statusCode;
    this.errors = errors;

    this.name = new.target.name;
  }
}
