import { prisma, selfProfileSelect } from "../lib/prisma";
import { hashPassword } from "../utils/hash";
import { toMeUser, toSelfProfileUser } from "../utils/users";
import { MeUser, SelfProfileUser } from "../types/auth";
import { getFinishedGamesStats } from "./usersService";
import { ApiError } from "../errors";

export class MeServiceError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export interface UpdateMeInput {
  username?: string;
  email?: string;
  password?: string;
  avatarUrl?: string | null;
}

export async function updateMe(
  currentUserId: string,
  input: UpdateMeInput,
): Promise<{ user: SelfProfileUser }> {
  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { id: true },
  });

  if (!currentUser) {
    throw new MeServiceError("User not found", 404);
  }

  if (input.email !== undefined) {
    const existingByEmail = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });

    if (existingByEmail && existingByEmail.id !== currentUserId) {
      throw new MeServiceError("Email already in use", 409);
    }
  }

  if (input.username !== undefined) {
    const existingByUsername = await prisma.user.findUnique({
      where: { username: input.username },
      select: { id: true },
    });

    if (existingByUsername && existingByUsername.id !== currentUserId) {
      throw new MeServiceError("Username already in use", 409);
    }
  }

  const data: {
    username?: string;
    email?: string;
    passwordHash?: string;
    avatarUrl?: string | null;
  } = {};

  if (input.username !== undefined) {
    data.username = input.username;
  }

  if (input.email !== undefined) {
    data.email = input.email;
  }

  if (input.password !== undefined) {
    data.passwordHash = await hashPassword(input.password);
  }

  if (input.avatarUrl !== undefined) {
    data.avatarUrl = input.avatarUrl;
  }

  if (Object.keys(data).length === 0) {
    throw new MeServiceError("At least one field must be provided", 400);
  }

  const updatedUser = await prisma.user.update({
    where: { id: currentUserId },
    data,
    select: selfProfileSelect,
  });

  return {
    user: toSelfProfileUser(updatedUser),
  };
}

export async function getMe(userId: string): Promise<{ user: MeUser }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: selfProfileSelect,
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const stats = await getFinishedGamesStats(user.id);
  return {
    user: toMeUser(user, stats),
  };
}
