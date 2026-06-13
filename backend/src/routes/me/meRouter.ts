// Project level
import {
  getMeController,
  getMeGames,
  updateMeAvatarController,
  updateMeController,
} from "controllers";
import { createAuthenticatedRouter, errorHandler } from "utils";
import photoUpload from "../../middlewares/cloudinary/upload";

export const meRouter = createAuthenticatedRouter();

meRouter.patch("/", errorHandler(updateMeController));
meRouter.patch(
  "/avatar",
  photoUpload.single("avatar"),
  errorHandler(updateMeAvatarController),
);
meRouter.get("/", errorHandler(getMeController));
meRouter.get("/games", errorHandler(getMeGames));
