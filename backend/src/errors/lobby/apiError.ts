export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
    public readonly details?: unknown
  ) {
    super(message);

    this.name = new.target.name;
  }
}
