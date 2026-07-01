import type { Request, Response, NextFunction } from "express";
import { userOperationTotal } from "../../metrics/userOperationMetrics";

type UserOperation =
  | "register"
  | "login"
  | "refresh"
  | "logout"
  | "get_profile"
  | "update_profile"
  | "list_friends"
  | "create_friend_request"
  | "update_friendship"
  | "delete_friendship";

const exactUserOperationRoutes: Record<string, UserOperation> = {
  "POST /auth/register": "register",
  "POST /auth/login": "login",
  "POST /auth/refresh": "refresh",
  "POST /auth/logout": "logout",
  "GET /me": "get_profile",
  "PATCH /me": "update_profile",
  "GET /me/friends": "list_friends",
  "POST /me/friends": "create_friend_request",
  "DELETE /me/friends": "delete_friendship",
};

function normalizePath(path: string) {
  if (path === "/") {
    return path;
  }

  return path.replace(/\/+$/, "");
}

function getUserOperation(req: Request): UserOperation | undefined {
  const path = normalizePath(req.path);

  if (req.method === "PATCH" && /^\/me\/friends\/[^/]+$/.test(path)) {
    return "update_friendship";
  }

  return exactUserOperationRoutes[`${req.method} ${path}`];
}

function getUserOperationStatus(statusCode: number) {
  return statusCode >= 200 && statusCode < 400 ? "success" : "failure";
}

export function userOperationMetricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const operation = getUserOperation(req);

  if (!operation) {
    return next();
  }

  res.on("finish", () => {
    userOperationTotal.inc({
      operation,
      status: getUserOperationStatus(res.statusCode),
    });
  });

  return next();
}
