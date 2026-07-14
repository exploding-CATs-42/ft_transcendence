import { SocketErrorCode, SocketErrorCodes } from "@exploding-cats/contracts";

interface SocketErrorOptions {
  code?: SocketErrorCode;
  errors?: unknown;
}

export class SocketError extends Error {
  public readonly code: SocketErrorCode;
  public readonly errors?: unknown;

  constructor(message: string, options?: SocketErrorOptions) {
    super(message);

    this.name = "SocketError";
    this.code = options?.code ?? SocketErrorCodes.UNKNOWN;
    this.errors = options?.errors;

    Object.setPrototypeOf(this, SocketError.prototype);
  }
}
