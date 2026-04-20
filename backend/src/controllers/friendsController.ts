import type { NextFunction, Request, Response } from "express";
import { createFriendRequestSchema } from "../schemas/friends/createFriendRequestSchema";
import { deleteFriendshipSchema } from "../schemas/friends/deleteFriendshipSchema";
import { listFriendsQuerySchema } from "../schemas/friends/listFriendsSchema";
import {
  updateFriendshipBodySchema,
  updateFriendshipParamsSchema,
} from "../schemas/friends/updateFriendshipSchema";
import {
  deleteFriendship,
  FriendsServiceError,
  listFriends,
  sendFriendRequest,
  updateFriendship,
} from "../services/friendsService";

export async function listFriendsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const parsed = listFriendsQuerySchema.safeParse(req.query);

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
  const friends = await listFriends({
    currentUserId: req.user.id,
    ...(parsed.data.status !== undefined
      ? { status: parsed.data.status }
      : {}),
  });

    return res.status(200).json({ friends });
  } catch (error) {
    if (error instanceof FriendsServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return next(error);
  }
}

export async function createFriendRequestController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const parsed = createFriendRequestSchema.safeParse(req.body);

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
    await sendFriendRequest({
      currentUserId: req.user.id,
      targetUserId: parsed.data.userId,
    });

    return res.status(201).json({ message: "Friend request sent" });
  } catch (error) {
    if (error instanceof FriendsServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return next(error);
  }
}

export async function updateFriendshipController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const parsedParams = updateFriendshipParamsSchema.safeParse(req.params);
  const parsedBody = updateFriendshipBodySchema.safeParse(req.body);

  if (!parsedParams.success || !parsedBody.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: {
        params: parsedParams.success ? undefined : parsedParams.error.flatten(),
        body: parsedBody.success ? undefined : parsedBody.error.flatten(),
      },
    });
  }

  if (!req.user) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    await updateFriendship({
      currentUserId: req.user.id,
      targetUserId: parsedParams.data.userId,
      action: parsedBody.data.action,
    });

    return res.status(200).json({ message: "Friendship updated" });
  } catch (error) {
    if (error instanceof FriendsServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return next(error);
  }
}

export async function deleteFriendshipController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const parsed = deleteFriendshipSchema.safeParse(req.body);

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
    await deleteFriendship({
      currentUserId: req.user.id,
      targetUserId: parsed.data.userId,
    });

    return res.status(200).json({ message: "Friendship deleted" });
  } catch (error) {
    if (error instanceof FriendsServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return next(error);
  }
}