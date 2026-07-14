// Libraries
import { NextFunction, Response } from "express";
import { Socket } from "socket.io";
import { ZodSchema } from "zod";
// Project level
import { SocketAckPayload, SocketErrorCodes } from "@exploding-cats/contracts";
import { AuthenticatedRequest } from "types";
import { SocketError, ValidationError } from "errors";
// Local level
import { validate } from "./validate";

export type AsyncController = (
  req: AuthenticatedRequest,
  res: Response,
) => Promise<void>;

export function errorHandler(controller: AsyncController) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    controller(req, res).catch(next);
  };
}

export type SocketHandler<T> = (parsed: T) => Promise<void>;

export type SocketAck = (response: SocketAckPayload) => void;

export function withErrorHandler<T>(
  schema: ZodSchema<T>,
  socket: Socket,
  errorEvent: string,
  event: SocketHandler<T>,
) {
  return async (data: unknown, ack?: SocketAck): Promise<void> => {
    // Socket.io passes the client's callback as the last argument
    // only when the client emits with one (e.g. emitWithAck).
    const reply = typeof ack === "function" ? ack : null;

    try {
      const parsed: T = validate(schema, data);

      await event(parsed);

      reply?.({ ok: true });
    } catch (error) {
      console.error("Socket error: ", error);

      const code =
        error instanceof SocketError ? error.code : SocketErrorCodes.UNKNOWN;
      const message =
        error instanceof Error ? error.message : "Unknown socket error";

      if (reply) {
        reply({ ok: false, code, message });

        return;
      }

      if (error instanceof SocketError || error instanceof ValidationError) {
        socket.emit(errorEvent, {
          code,
          message: error.message,
          errors: error.errors,
        });

        return;
      }

      socket.emit(errorEvent, {
        code,
        message,
      });
    }
  };
}
