import express from "express";
import {
  createGameController,
  deleteGameController,
  getGameByIdController,
  getGamesController
} from "../../controllers/gamesController";
import { authMiddleware } from "../../middlewares/authMiddleware";

export const lobbyRouter = express.Router();

lobbyRouter.use(authMiddleware);

lobbyRouter.get("/", getGamesController);
lobbyRouter.get("/:gameId", getGameByIdController);
lobbyRouter.post("/", createGameController);
lobbyRouter.delete("/:gameId", deleteGameController);
