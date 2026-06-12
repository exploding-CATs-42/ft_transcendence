import {
  getMeController,
  getMeGames,
  updateMeAvatarController,
  updateMeController,
} from "../../controllers/meController";
import photoUpload from "../../middlewares/cloudinary/upload";

import { createAuthenticatedRouter } from "../../utils/authenticatedRouter";
import { errorHandler } from "../../utils/errorHandler";

export const meRouter = createAuthenticatedRouter();

meRouter.patch("/", errorHandler(updateMeController));

meRouter.patch(
  "/avatar",
  photoUpload.single("avatar"),
  errorHandler(updateMeAvatarController),
);

meRouter.get("/", errorHandler(getMeController));
meRouter.get("/games", errorHandler(getMeGames));
