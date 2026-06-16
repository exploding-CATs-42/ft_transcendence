// Libraries
import type { Response } from "express";
// Project level
import { updateMeSchema } from "schemas";
import { AuthenticatedRequest } from "types";
import { validate } from "utils";
import { getMe, updateMe } from "services";
import { getUserGames } from "../services/usersService";

export async function updateMeController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const parsedBody = validate(updateMeSchema, req.body);

  const { username, email, passwordNew, passwordOld, avatarUrl } = parsedBody;

  const updateData = {
    ...(username !== undefined && { username }),
    ...(email !== undefined && { email }),
    ...(passwordNew !== undefined && { passwordNew }),
    ...(passwordOld !== undefined && { passwordOld }),
    ...(avatarUrl !== undefined && { avatarUrl }),
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
