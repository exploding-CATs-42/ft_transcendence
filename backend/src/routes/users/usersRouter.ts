// Libraries
import express from "express";
// Project level
import {
  getUserByIdController,
  getUserGamesController,
  searchUsersController,
} from "controllers";
import { listFriendsController } from "../../controllers/friendsController";
import { authMiddleware } from "../../middlewares";

export const usersRouter = express.Router();

usersRouter.get("/", searchUsersController);
usersRouter.get("/:userId", getUserByIdController);
usersRouter.get("/:userId/games", getUserGamesController);
usersRouter.get("/:userId/friends", authMiddleware, listFriendsController);
