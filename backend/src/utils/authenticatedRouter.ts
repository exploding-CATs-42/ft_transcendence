import type { NextFunction, Response, Router } from "express";
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { AuthenticatedRequest } from "../types/auth";

type AuthenticatedHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
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
