// Project level
import {
  createFriendRequestController,
  deleteFriendshipController,
  listFriendsController,
  updateFriendshipController,
} from "controllers";
import { createAuthenticatedRouter, errorHandler } from "utils";

export const friendsRouter = createAuthenticatedRouter();

friendsRouter.get("/", errorHandler(listFriendsController));
friendsRouter.post("/", errorHandler(createFriendRequestController));
friendsRouter.patch("/:userId", errorHandler(updateFriendshipController));
friendsRouter.delete("/", errorHandler(deleteFriendshipController));
