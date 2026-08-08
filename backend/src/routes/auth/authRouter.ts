// Libraries
import express from "express";
// Project level
import {
  loginController,
  logoutController,
  refreshController,
  registerController,
} from "controllers/authController";
import { loginRateLimiter } from "middlewares";

export const authRouter = express.Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginRateLimiter, loginController);
authRouter.post("/logout", logoutController);
authRouter.post("/refresh", refreshController);
