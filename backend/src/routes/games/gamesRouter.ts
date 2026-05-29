import {
  createGameController,
  deleteGameController,
  getGameByIdController,
  getGamesController,
} from "../../controllers/gamesController";
import { errorMiddleware } from "../../middlewares";
import { asyncHandler } from "../../utils/asyncHandler";
import { createAuthenticatedRouter } from "../../utils/authenticatedRouter";

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

gamesRouter.get("/", asyncHandler(getGamesController));
gamesRouter.get("/:gameId", asyncHandler(getGameByIdController));
gamesRouter.post("/", asyncHandler(createGameController));
gamesRouter.delete("/:gameId", asyncHandler(deleteGameController));

/**
 * Error handling middleware for all game routes.
 * It catches all errors thrown in route handlers,
 * allowing to avoid the duplicated try catch statements
 */
gamesRouter.use(errorMiddleware);
