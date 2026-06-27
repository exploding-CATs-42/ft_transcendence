// Project level
import {
  createFriendRequestController,
  deleteFriendshipController,
  listFriendsController,
  updateFriendshipController,
} from "controllers";
import { createAuthenticatedRouter, errorHandler } from "utils";

export const friendsRouter = createAuthenticatedRouter();

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

friendsRouter.get("/", errorHandler(listFriendsController));
friendsRouter.post("/", errorHandler(createFriendRequestController));
friendsRouter.patch("/:userId", errorHandler(updateFriendshipController));
friendsRouter.delete("/", errorHandler(deleteFriendshipController));
