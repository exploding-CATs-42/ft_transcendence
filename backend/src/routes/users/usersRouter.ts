import express from "express";
import {
  getUserByIdController,
  getUserGamesController,
  loginController,
  logoutController,
  refreshController,
  registerController,
  searchUsersController,
} from "../../controllers/usersController";
import { listFriendsController } from "../../controllers/friendsController";
import { authMiddleware } from "../../middlewares";

export const usersRouter = express.Router();

usersRouter.post("/register", registerController);
usersRouter.post("/login", loginController);
usersRouter.post("/logout", logoutController);
usersRouter.post("/refresh", refreshController);

usersRouter.get("/", searchUsersController);
usersRouter.get("/:userId", getUserByIdController);
usersRouter.get("/:userId/games", getUserGamesController);
usersRouter.get("/:userId/friends", authMiddleware, listFriendsController);
