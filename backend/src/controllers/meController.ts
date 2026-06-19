// Libraries
import type { Response } from "express";
// Project level
import { updateMeSchema } from "@exploding-cats/shared-schemas";
import { AuthenticatedRequest } from "types";
import { validate } from "utils";
import { getMe, updateMe, updateMeAvatar } from "services";
import { getUserGames } from "../services/usersService";

export async function updateMeController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const parsedBody = validate(updateMeSchema, req.body);

  const { username, email, passwordNew, passwordOld } = parsedBody;

  const updateData = {
    ...(username !== undefined && { username }),
    ...(email !== undefined && { email }),
    ...(passwordNew !== undefined && { passwordNew }),
    ...(passwordOld !== undefined && { passwordOld }),
  };

  const result = await updateMe(req.user.id, updateData);

  res.status(200).json(result);
}

export async function getMeController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const user = await getMe(req.user.id);
  res.status(200).json(user);
}

export async function getMeGames(req: AuthenticatedRequest, res: Response) {
  const games = await getUserGames(req.user.id);
  res.status(200).json({ games });
}

export async function updateMeAvatarController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const avatarUrl = await updateMeAvatar(req.user.id, req.file);
  res.status(200).json({ avatarUrl });
}
