import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../types/auth";

export type AsyncController = (
  req: AuthenticatedRequest,
  res: Response
) => Promise<void>;

export function asyncHandler(controller: AsyncController) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    controller(req, res).catch(next);
  };
}
