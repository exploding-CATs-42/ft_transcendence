// Project level
import {
  createGameController,
  deleteGameController,
  getGamesController,
  getCurrentGameController,
} from "controllers";
import { createAuthenticatedRouter, errorHandler } from "utils";

export const gamesRouter = createAuthenticatedRouter();

/**
 * ⚠️ All routes defined in this router require authentication.
 *
 * If a request reaches this router, it means:
 * - The user has already been authenticated
 * - Unauthorized requests are rejected before reaching this layer
 *
 * Authentication is handled by `router.use(authMiddleware)` call
 * inside `createAuthenticatedRouter()`.
 * And in case of successfull authentication
 * the request is being transformed from Request type to AuthenticatedRequest
 *
 * For more info see authenticatedRouter.ts
 */

gamesRouter.get("/", errorHandler(getGamesController));
gamesRouter.get("/current", errorHandler(getCurrentGameController));
gamesRouter.post("/", errorHandler(createGameController));
gamesRouter.delete("/:gameId", errorHandler(deleteGameController));
