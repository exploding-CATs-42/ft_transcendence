import express from "express";
import {
  getUserByIdController,
  getUserGamesController,
  getUserStatsController,
  loginController,
  logoutController,
  refreshController,
  registerController,
  searchUsersController,
} from "../../controllers/usersController";

export const usersRouter = express.Router();

usersRouter.post("/register", registerController);
usersRouter.post("/login", loginController);
usersRouter.post("/logout", logoutController);
usersRouter.post("/refresh", refreshController);

usersRouter.get("/", searchUsersController);
usersRouter.get("/:userId/stats", getUserStatsController);
usersRouter.get("/:userId/games", getUserGamesController);
usersRouter.get("/:userId", getUserByIdController);