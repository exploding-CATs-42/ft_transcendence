import {
  getMeController,
  updateMeController,
} from "../../controllers/meController";
import photoUpload from "../../middlewares/cloudinary/upload";

import { createAuthenticatedRouter } from "../../utils/authenticatedRouter";
import { errorHandler } from "../../utils/errorHandler";

export const meRouter = createAuthenticatedRouter();

meRouter.patch(
  "/",
  photoUpload.single("avatar"),
  errorHandler(updateMeController),
);
meRouter.get("/", errorHandler(getMeController));
