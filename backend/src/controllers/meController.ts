import type { Response } from "express";
import { updateMeSchema } from "../schemas/me/updateMeSchema";
import { AuthenticatedRequest } from "../types/auth";
import { validate } from "../utils/validate";
import { getMe, updateMe } from "../services/meService";

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
    ...(parsedBody.password !== undefined
      ? { password: parsedBody.password }
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
