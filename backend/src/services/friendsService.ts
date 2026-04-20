import { FriendshipStatus } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import type { FriendDirection, FriendListItem } from "../types/auth";
import {
  publicProfileSelect,
  toPublicProfileUser,
} from "./usersService";

export class FriendsServiceError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function getCanonicalPair(firstUserId: string, secondUserId: string) {
  return firstUserId < secondUserId
    ? { userLowId: firstUserId, userHighId: secondUserId }
    : { userLowId: secondUserId, userHighId: firstUserId };
}

function getDirection(params: {
  currentUserId: string;
  requestedById: string;
  status: FriendshipStatus;
}): FriendDirection {
  if (params.status === FriendshipStatus.ACCEPTED) {
    return "accepted";
  }

  return params.requestedById === params.currentUserId
    ? "outgoing"
    : "incoming";
}

export async function listFriends(params: {
  currentUserId: string;
  status?: "incoming";
}): Promise<FriendListItem[]> {
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { userLowId: params.currentUserId },
        { userHighId: params.currentUserId },
      ],
      ...(params.status === "incoming"
        ? {
            status: FriendshipStatus.PENDING,
            requestedById: {
              not: params.currentUserId,
            },
          }
        : {}),
    },
    include: {
      userLow: {
        select: publicProfileSelect,
      },
      userHigh: {
        select: publicProfileSelect,
      },
    },
  });

  return friendships.map((friendship) => {
    const otherUser =
      friendship.userLowId === params.currentUserId
        ? friendship.userHigh
        : friendship.userLow;

    return {
      user: toPublicProfileUser(otherUser),
      status: friendship.status,
      direction: getDirection({
        currentUserId: params.currentUserId,
        requestedById: friendship.requestedById,
        status: friendship.status,
      }),
    };
  });
}

export async function sendFriendRequest(params: {
  currentUserId: string;
  targetUserId: string;
}): Promise<void> {
  if (params.currentUserId === params.targetUserId) {
    throw new FriendsServiceError(
      "You cannot send a friend request to yourself",
      400
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: params.targetUserId },
    select: { id: true },
  });

  if (!targetUser) {
    throw new FriendsServiceError("User not found", 404);
  }

  const pair = getCanonicalPair(params.currentUserId, params.targetUserId);

  const existingFriendship = await prisma.friendship.findUnique({
    where: {
      userLowId_userHighId: pair,
    },
  });

  if (!existingFriendship) {
    await prisma.friendship.create({
      data: {
        userLowId: pair.userLowId,
        userHighId: pair.userHighId,
        requestedById: params.currentUserId,
        status: FriendshipStatus.PENDING,
      },
    });

    return;
  }

  if (existingFriendship.status === FriendshipStatus.REJECTED) {
    await prisma.friendship.update({
      where: {
        userLowId_userHighId: pair,
      },
      data: {
        requestedById: params.currentUserId,
        status: FriendshipStatus.PENDING,
      },
    });

    return;
  }

  throw new FriendsServiceError("Friendship already exists", 409);
}

export async function updateFriendship(params: {
  currentUserId: string;
  targetUserId: string;
  action: "accept" | "reject";
}): Promise<void> {
  if (params.currentUserId === params.targetUserId) {
    throw new FriendsServiceError("Invalid friendship target", 400);
  }

  const pair = getCanonicalPair(params.currentUserId, params.targetUserId);

  const friendship = await prisma.friendship.findUnique({
    where: {
      userLowId_userHighId: pair,
    },
  });

  if (!friendship) {
    throw new FriendsServiceError("Friendship not found", 404);
  }

  if (friendship.status !== FriendshipStatus.PENDING) {
    throw new FriendsServiceError(
      "Only pending friendships can be updated",
      409
    );
  }

  if (friendship.requestedById === params.currentUserId) {
    throw new FriendsServiceError(
      "You cannot update your own outgoing request",
      409
    );
  }

  await prisma.friendship.update({
    where: {
      userLowId_userHighId: pair,
    },
    data: {
      status:
        params.action === "accept"
          ? FriendshipStatus.ACCEPTED
          : FriendshipStatus.REJECTED,
    },
  });
}

export async function deleteFriendship(params: {
  currentUserId: string;
  targetUserId: string;
}): Promise<void> {
  if (params.currentUserId === params.targetUserId) {
    throw new FriendsServiceError("Invalid friendship target", 400);
  }

  const pair = getCanonicalPair(params.currentUserId, params.targetUserId);

  const friendship = await prisma.friendship.findUnique({
    where: {
      userLowId_userHighId: pair,
    },
  });

  if (!friendship) {
    throw new FriendsServiceError("Friendship not found", 404);
  }

  const canDeleteOutgoingPending =
    friendship.status === FriendshipStatus.PENDING &&
    friendship.requestedById === params.currentUserId;

  const canDeleteAccepted =
    friendship.status === FriendshipStatus.ACCEPTED;

  if (!canDeleteOutgoingPending && !canDeleteAccepted) {
    throw new FriendsServiceError("Friendship cannot be deleted", 409);
  }

  await prisma.friendship.delete({
    where: {
      userLowId_userHighId: pair,
    },
  });
}