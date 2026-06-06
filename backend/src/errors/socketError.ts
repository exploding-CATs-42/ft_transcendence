export class SocketError extends Error {
  public readonly errors?: unknown;

  constructor(message: string, errors?: unknown) {
    super(message);

    this.name = "SocketError";
    this.errors = errors;

    Object.setPrototypeOf(this, SocketError.prototype);
  }
}
