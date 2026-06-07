import { errorMiddleware } from "../../middlewares";

import {
  getMeController,
  updateMeController,
} from "../../controllers/meController";

import { createAuthenticatedRouter } from "../../utils/authenticatedRouter";
import { errorHandler } from "../../utils/errorHandler";

export const meRouter = createAuthenticatedRouter();

meRouter.patch("/", errorHandler(updateMeController));
meRouter.get("/", errorHandler(getMeController));

meRouter.use(errorMiddleware);
