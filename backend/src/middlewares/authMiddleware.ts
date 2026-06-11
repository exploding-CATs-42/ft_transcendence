// Libraries
import type { NextFunction, Request, Response } from "express";
// Project level
import { verifyAccessToken } from "utils";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authorizationHeader = req.header("Authorization");

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid token" });
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();

  if (!token) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
    };

    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
