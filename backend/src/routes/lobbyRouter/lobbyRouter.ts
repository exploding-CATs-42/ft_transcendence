import express from "express";
import {
  createGameController,
  getGameByIdController,
  getGamesController
} from "../../controllers/gamesController";

export const lobbyRouter = express.Router();

lobbyRouter.get("/", getGamesController);
lobbyRouter.get("/:gameId", getGameByIdController);
lobbyRouter.post("/", createGameController);
