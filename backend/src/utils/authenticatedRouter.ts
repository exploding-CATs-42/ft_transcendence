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
  get: (path: string, ...handlers: AuthenticatedHandler[]) => void;
  post: (path: string, ...handlers: AuthenticatedHandler[]) => void;
  patch: (path: string, ...handlers: AuthenticatedHandler[]) => void;
  delete: (path: string, ...handlers: AuthenticatedHandler[]) => void;
};

export function createAuthenticatedRouter(): AuthenticatedRouter {
  const router = express.Router();
  router.use(authMiddleware);
  return router as AuthenticatedRouter;
}
