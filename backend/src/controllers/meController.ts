import type { NextFunction, Request, Response } from "express";
import { updateMeSchema } from "../schemas/me/updateMeSchema";
import { MeServiceError, updateMe } from "../services/meService";

export async function updateMeController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const parsed = updateMeSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: parsed.error.flatten(),
    });
  }

  if (!req.user) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const result = await updateMe(req.user.id, {
      ...(parsed.data.username !== undefined
        ? { username: parsed.data.username }
        : {}),
      ...(parsed.data.email !== undefined
        ? { email: parsed.data.email }
        : {}),
      ...(parsed.data.password !== undefined
        ? { password: parsed.data.password }
        : {}),
      ...(parsed.data.avatarUrl !== undefined
        ? { avatarUrl: parsed.data.avatarUrl }
        : {}),
    });
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof MeServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return next(error);
  }
}