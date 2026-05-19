import {
  createGameController,
  deleteGameController,
  getGameByIdController,
  getGamesController,
} from "../../controllers/gamesController";
import { errorMiddleware } from "../../middlewares/games/ErrorRequestMiddleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { createAuthenticatedRouter } from "../../utils/authenticatedRouter";

export const gamesRouter = createAuthenticatedRouter();

gamesRouter.get("/", asyncHandler(getGamesController));
gamesRouter.get("/:gameId", asyncHandler(getGameByIdController));
gamesRouter.post("/", asyncHandler(createGameController));
gamesRouter.delete("/:gameId", asyncHandler(deleteGameController));

gamesRouter.use(errorMiddleware);
