// Libraries
import type { Response } from "express";
// Project level
import {
  listFriendsQuerySchema,
  createFriendRequestSchema,
  deleteFriendshipSchema,
  updateFriendshipBodySchema,
  updateFriendshipParamsSchema,
  userIdParamsSchema,
} from "@exploding-cats/contracts";
import {
  deleteFriendship,
  listFriends,
  sendFriendRequest,
  updateFriendship,
} from "services";
import { AuthenticatedRequest } from "types";
import { validate } from "utils";

export async function listFriendsController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const query = validate(listFriendsQuerySchema, req.query);

  const params = userIdParamsSchema.safeParse(req.params);
  const userId = params.success ? params.data.userId : req.user.id;

  const friends = await listFriends({
    currentUserId: userId,
    ...(query.view !== undefined && { view: query.view }),
  });

  res.status(200).json({ friends });
}

export async function createFriendRequestController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const body = validate(createFriendRequestSchema, req.body);

  await sendFriendRequest({
    currentUserId: req.user.id,
    targetUserId: body.userId,
  });

  res.status(201).json({ message: "Friend request sent" });
}

export async function updateFriendshipController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const params = validate(updateFriendshipParamsSchema, req.params);
  const body = validate(updateFriendshipBodySchema, req.body);

  await updateFriendship({
    currentUserId: req.user.id,
    targetUserId: params.userId,
    action: body.action,
  });

  res.status(200).json({ message: "Friendship updated" });
}

export async function deleteFriendshipController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const body = validate(deleteFriendshipSchema, req.body);

  await deleteFriendship({
    currentUserId: req.user.id,
    targetUserId: body.userId,
  });

  res.status(200).json({ message: "Friendship deleted" });
}
