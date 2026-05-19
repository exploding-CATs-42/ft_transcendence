import {
  createGameController,
  deleteGameController,
  getGameByIdController,
  getGamesController
} from "../../controllers/gamesController";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { errorMiddleware } from "../../middlewares/lobby/ErrorRequestMiddleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { createAuthenticatedRouter } from "./createAuthenticatedRouter";

export const lobbyRouter = createAuthenticatedRouter();

lobbyRouter.use(authMiddleware);

lobbyRouter.get("/", asyncHandler(getGamesController));
lobbyRouter.get("/:gameId", asyncHandler(getGameByIdController));
lobbyRouter.post("/", asyncHandler(createGameController));
lobbyRouter.delete("/:gameId", asyncHandler(deleteGameController));

lobbyRouter.use(errorMiddleware);
