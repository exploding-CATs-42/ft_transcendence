// Project level
import {
  getUserByIdController,
  getUserGamesController,
  searchUsersController,
} from "controllers";
import { listFriendsController } from "../../controllers/friendsController";
import { createAuthenticatedRouter, errorHandler } from "utils";

export const usersRouter = createAuthenticatedRouter();

/**
 * ⚠️ All routes defined in this router require authentication.
 *
 * If a request reaches this router, it means:
 * - The user has already been authenticated
 * - Unauthorized requests are rejected before reaching this layer
 *
 * Authentication is handled by `router.use(authMiddleware)` call
 * inside `createAuthenticatedRouter()`.
 * And in case of successful authentication
 * the request is being transformed from Request type to AuthenticatedRequest
 *
 * For more info see authenticatedRouter.ts
 */

usersRouter.get("/", errorHandler(searchUsersController));
usersRouter.get("/:userId", errorHandler(getUserByIdController));
usersRouter.get("/:userId/games", errorHandler(getUserGamesController));
usersRouter.get("/:userId/friends", errorHandler(listFriendsController));
