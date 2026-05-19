export class SocketError extends Error {
  public readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);

    this.name = "SocketError";
    this.details = details;

    Object.setPrototypeOf(this, SocketError.prototype);
  }
}
