// Project level
import { getMeController, getMeGames, updateMeController } from "controllers";
import { createAuthenticatedRouter, errorHandler } from "utils";

export const meRouter = createAuthenticatedRouter();

meRouter.patch("/", errorHandler(updateMeController));
meRouter.get("/", errorHandler(getMeController));
meRouter.get("/games", errorHandler(getMeGames));
