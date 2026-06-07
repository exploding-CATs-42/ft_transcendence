// Libraries
import type { Response } from "express";
// Project level
import { updateMeSchema } from "schemas";
import { AuthenticatedRequest } from "types";
import { validate } from "utils";
import { getMe, updateMe } from "services";

export async function updateMeController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const parsedBody = validate(updateMeSchema, req.body);

  const result = await updateMe(req.user.id, {
    ...(parsedBody.username !== undefined
      ? { username: parsedBody.username }
      : {}),

    ...(parsedBody.email !== undefined ? { email: parsedBody.email } : {}),

    ...(parsedBody.passwordNew !== undefined
      ? { passwordNew: parsedBody.passwordNew }
      : {}),

    ...(parsedBody.passwordOld !== undefined
      ? { passwordOld: parsedBody.passwordOld }
      : {}),

    ...(parsedBody.avatarUrl !== undefined
      ? { avatarUrl: parsedBody.avatarUrl }
      : {}),
  });
  res.status(200).json(result);
}

export async function getMeController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const user = await getMe(req.user.id);
  res.status(200).json(user);
}
