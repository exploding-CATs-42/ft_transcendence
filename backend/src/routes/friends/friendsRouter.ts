// Libraries
import express from "express";
// Project level
import { authMiddleware } from "middlewares";
import {
  createFriendRequestController,
  deleteFriendshipController,
  listFriendsController,
  updateFriendshipController,
} from "controllers";

export const friendsRouter = express.Router();

friendsRouter.use(authMiddleware);

friendsRouter.get("/", listFriendsController);
friendsRouter.post("/", createFriendRequestController);
friendsRouter.patch("/:userId", updateFriendshipController);
friendsRouter.delete("/", deleteFriendshipController);
