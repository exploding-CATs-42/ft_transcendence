import express from "express";
import {
  loginController,
  logoutController,
  refreshController,
  registerController
} from "../../controllers/usersController";

export const usersRouter = express.Router();

usersRouter.post("/register", registerController);
usersRouter.post("/login", loginController);
usersRouter.post("/logout", logoutController);
usersRouter.post("/refresh", refreshController);
