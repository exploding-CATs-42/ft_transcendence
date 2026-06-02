import { errorMiddleware } from "../../middlewares";

import {
  getMeController,
  updateMeController,
} from "../../controllers/meController";

import { createAuthenticatedRouter } from "../../utils/authenticatedRouter";
import { asyncHandler } from "../../utils/asyncHandler";

export const meRouter = createAuthenticatedRouter();

meRouter.patch("/", asyncHandler(updateMeController));
meRouter.get("/", asyncHandler(getMeController));

meRouter.use(errorMiddleware);
