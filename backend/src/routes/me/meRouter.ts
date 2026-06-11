// Project level
import { getMeController, updateMeController } from "controllers";
import { createAuthenticatedRouter, errorHandler } from "utils";

export const meRouter = createAuthenticatedRouter();

meRouter.patch("/", errorHandler(updateMeController));
meRouter.get("/", errorHandler(getMeController));
