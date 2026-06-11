// Libraries
import { NextFunction, Response } from "express";
import { Socket } from "socket.io";
import { ZodSchema } from "zod";
// Project level
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

export function withErrorHandler<T>(
  schema: ZodSchema<T>,
  socket: Socket,
  errorEvent: string,
  event: SocketHandler<T>,
) {
  return async (data: unknown): Promise<void> => {
    try {
      const parsed: T = validate(schema, data);

      await event(parsed);
    } catch (error) {
      console.error("Socket error: ", error);

      if (error instanceof SocketError || error instanceof ValidationError) {
        socket.emit(errorEvent, {
          message: error.message,
          errors: error.errors,
        });

        return;
      }

      if (error instanceof Error) {
        socket.emit(errorEvent, {
          message: error.message,
        });

        return;
      }

      socket.emit(errorEvent, {
        message: "Unknown socket error",
      });
    }
  };
}
