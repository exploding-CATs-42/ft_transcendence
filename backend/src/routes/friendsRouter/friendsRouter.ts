import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import {
  createFriendRequestController,
  deleteFriendshipController,
  listFriendsController,
  updateFriendshipController,
} from "../../controllers/friendsController";

export const friendsRouter = express.Router();

friendsRouter.use(authMiddleware);

friendsRouter.get("/", listFriendsController);
friendsRouter.post("/", createFriendRequestController);
friendsRouter.patch("/:userId", updateFriendshipController);
friendsRouter.delete("/", deleteFriendshipController);