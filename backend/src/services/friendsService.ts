// Project level
import { publicProfileSelect, prisma } from "lib/prisma";
import { toProfileUser } from "mappers";
import {
  FriendItem,
  FriendshipDirection,
  FriendshipRequestAction,
  FriendshipStatus,
  FriendshipView,
  UserId,
} from "@exploding-cats/contracts";

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
}): FriendshipDirection {
  return params.requestedById === params.currentUserId
    ? FriendshipDirection.OUTGOING
    : FriendshipDirection.INCOMING;
}

function filter(friendships: FriendItem[], view?: FriendshipView) {
  switch (view) {
    case FriendshipView.ACCEPTED:
      return friendships.filter((f) => f.status === FriendshipStatus.ACCEPTED);

    case FriendshipView.INCOMING:
      return friendships.filter(
        (f) =>
          f.status === FriendshipStatus.PENDING &&
          f.direction === FriendshipDirection.INCOMING,
      );

    case FriendshipView.FRIENDS_AND_REQUESTS:
      return friendships.filter(
        (f) =>
          f.status === FriendshipStatus.ACCEPTED ||
          f.status === FriendshipStatus.PENDING,
      );

    default:
      return friendships;
  }
}

export async function listFriends(params: {
  currentUserId: string;
  view?: FriendshipView;
}): Promise<FriendItem[]> {
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

/*
  Mirrors the FRIENDS_AND_REQUESTS view: notify everyone whose friends tab
  currently displays this user — accepted friends and either participant in a
  pending friendship request.
*/
export async function listOnlineStatusRecipientIds(
  userId: UserId,
): Promise<UserId[]> {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: {
        in: [FriendshipStatus.ACCEPTED, FriendshipStatus.PENDING],
      },
      OR: [{ userLowId: userId }, { userHighId: userId }],
    },
    select: { userLowId: true, userHighId: true },
  });

  return friendships.map((friendship) =>
    friendship.userLowId === userId
      ? friendship.userHighId
      : friendship.userLowId,
  );
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
    select: {
      requestedById: true,
      status: true,
    },
  });

  switch (existingFriendship?.status) {
    case "PENDING":
      if (existingFriendship.requestedById === params.currentUserId) {
        throw new FriendsServiceError("Friend request already sent", 409);
      }

      throw new FriendsServiceError(
        "This user has already sent you a friend request",
        409,
      );

    case "ACCEPTED":
      throw new FriendsServiceError(
        "You cannot send a friend request to your friend",
        409,
      );
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
  action: FriendshipRequestAction;
}): Promise<void> {
  if (params.currentUserId === params.targetUserId) {
    throw new FriendsServiceError("Invalid friendship target", 409);
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
      "You cannot accept or reject a request you sent",
      409,
    );
  }

  if (params.action == FriendshipRequestAction.REJECT) {
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
    throw new FriendsServiceError("Invalid friendship target", 409);
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
