// Libraries
import express from "express";
import type { NextFunction, Response, Router } from "express";
// Project level
import { authMiddleware } from "middlewares";
import { AuthenticatedRequest } from "types";

type AuthenticatedHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => unknown;

type AuthenticatedRouter = Router & {
  get(path: string, handler: AuthenticatedHandler): void;
  post(path: string, handler: AuthenticatedHandler): void;
  patch(path: string, handler: AuthenticatedHandler): void;
  delete(path: string, handler: AuthenticatedHandler): void;
};

export function createAuthenticatedRouter(): AuthenticatedRouter {
  const router = express.Router();
  router.use(authMiddleware);
  return router as AuthenticatedRouter;
}
