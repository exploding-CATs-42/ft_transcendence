import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import { Socket } from "socket.io";

export type AsyncController = (
  req: AuthenticatedRequest,
  res: Response,
) => Promise<void>;

export function asyncHandler(controller: AsyncController) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    controller(req, res).catch(next);
  };
}

export type SocketHandler = (data: unknown) => Promise<void>;

export async function withErrorHandler(
  socket: Socket,
  errorEvent: string,
  event: SocketHandler,
) {
  return async (data: unknown): Promise<void> => {
    try {
      await event(data);
    } catch (error) {
      socket.emit(errorEvent, {
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };
}
