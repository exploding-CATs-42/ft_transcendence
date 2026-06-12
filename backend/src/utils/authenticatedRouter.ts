import type { NextFunction, Response, Router } from "express";
import express from "express";
import { authMiddleware } from "../middlewares";
import { AuthenticatedRequest } from "../types/auth";

type AuthenticatedHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => unknown;

// allow middleware chaining
type AuthenticatedRouter = Router & {
  get: (path: string, ...handlers: AuthenticatedHandler[]) => void;
  post: (path: string, ...handlers: AuthenticatedHandler[]) => void;
  patch: (path: string, ...handlers: AuthenticatedHandler[]) => void;
  delete: (path: string, ...handlers: AuthenticatedHandler[]) => void;
};

export function createAuthenticatedRouter(): AuthenticatedRouter {
  const router = express.Router();

  router.use(authMiddleware); // global middleware

  return router as AuthenticatedRouter;
}
