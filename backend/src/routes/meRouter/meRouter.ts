import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { updateMeController } from "../../controllers/meController";

export const meRouter = express.Router();

meRouter.patch("/", authMiddleware, updateMeController);