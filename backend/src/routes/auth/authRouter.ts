// Libraries
import express from "express";
// Project level
import {
  loginController,
  logoutController,
  refreshController,
  registerController,
} from "controllers/authController";

export const authRouter = express.Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.post("/logout", logoutController);
authRouter.post("/refresh", refreshController);
