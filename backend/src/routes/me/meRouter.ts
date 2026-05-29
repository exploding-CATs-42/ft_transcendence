import { errorMiddleware } from "../../middlewares";
import { updateMeController } from "../../controllers/meController";

import { createAuthenticatedRouter } from "../../utils/authenticatedRouter";
import { asyncHandler } from "../../utils/asyncHandler";

export const meRouter = createAuthenticatedRouter();

meRouter.patch("/", asyncHandler(updateMeController));

meRouter.use(errorMiddleware);
