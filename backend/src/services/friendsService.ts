// Project level
import { FriendshipStatus } from "generated/prisma/client";
import { publicProfileSelect, prisma } from "lib/prisma";
import { FriendDirection, FriendListItem } from "types";
import { toProfileUser } from "mappers";
import { FriendshipView } from "@exploding-cats/contracts";

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

function filter(friendships: FriendListItem[], view?: FriendshipView) {
  switch (view) {
    case FriendshipView.ACCEPTED:
      return friendships.filter((f) => f.status === FriendshipStatus.ACCEPTED);

    case FriendshipView.INCOMING:
      return friendships.filter(
        (f) =>
          f.status === FriendshipStatus.PENDING && f.direction === "incoming",
      );

    case FriendshipView.FRIENDS_AND_REQUESTS:
      return friendships.filter(
        (f) =>
          f.status === FriendshipStatus.ACCEPTED ||
          (f.status === FriendshipStatus.PENDING && f.direction === "incoming"),
      );

    default:
      return friendships;
  }
}

export async function listFriends(params: {
  currentUserId: string;
  view?: FriendshipView;
}): Promise<FriendListItem[]> {
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { userLowId: params.currentUserId },
        { userHighId: params.currentUserId },
      ],
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

  const items = friendships.map((friendship) => {
    const otherUser =
      friendship.userLowId === params.currentUserId
        ? friendship.userHigh
        : friendship.userLow;

    return {
      user: toProfileUser(otherUser),
      status: friendship.status,
      direction: getDirection({
        currentUserId: params.currentUserId,
        requestedById: friendship.requestedById,
        status: friendship.status,
      }),
    };
  });

  return filter(items, params.view);
}

export async function sendFriendRequest(params: {
  currentUserId: string;
  targetUserId: string;
}): Promise<void> {
  if (params.currentUserId === params.targetUserId) {
    throw new FriendsServiceError(
      "You cannot send a friend request to yourself",
      400,
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

  if (existingFriendship) {
    throw new FriendsServiceError("Friend request already sent", 409);
  }

  await prisma.friendship.create({
    data: {
      userLowId: pair.userLowId,
      userHighId: pair.userHighId,
      requestedById: params.currentUserId,
      status: FriendshipStatus.PENDING,
    },
  });
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
      409,
    );
  }

  if (friendship.requestedById === params.currentUserId) {
    throw new FriendsServiceError(
      "You cannot update your own outgoing request",
      409,
    );
  }

  if (params.action == "reject") {
    await prisma.friendship.delete({
      where: {
        userLowId_userHighId: pair,
      },
    });
    return;
  }

  await prisma.friendship.update({
    where: {
      userLowId_userHighId: pair,
    },
    data: {
      status: FriendshipStatus.ACCEPTED,
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

  const canDeleteAccepted = friendship.status === FriendshipStatus.ACCEPTED;

  if (!canDeleteOutgoingPending && !canDeleteAccepted) {
    throw new FriendsServiceError("Friendship cannot be deleted", 409);
  }

  await prisma.friendship.delete({
    where: {
      userLowId_userHighId: pair,
    },
  });
}
