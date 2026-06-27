// Project level
import { ApiError } from "errors";
import cloudinary from "lib/cloudinary/cloudinary";
import { prisma, selfProfileSelect } from "lib/prisma";
import { comparePassword, hashPassword } from "utils";
import { toMyProfileUser, toSelfProfileUser } from "mappers";
import {
  MyProfileUser,
  MyProfileUserWithStats,
} from "@exploding-cats/contracts";
// Local level
import { getFinishedGamesStats } from "./usersService";

export class MeServiceError extends ApiError {
  constructor(message: string, statusCode = 400) {
    super(message, statusCode);
  }
}

export interface UpdateMeInput {
  username?: string;
  email?: string;
  passwordOld?: string;
  passwordNew?: string;
}

async function validatePassword(currentUserId: string, input: UpdateMeInput) {
  if (input.passwordNew && !input.passwordOld) {
    throw new MeServiceError(
      "Enter your current password to set a new password",
      409,
    );
  }

  if (input.passwordOld && !input.passwordNew) {
    throw new MeServiceError("Enter your new password", 409);
  }

  if (!input.passwordOld) {
    return;
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { passwordHash: true },
  });

  if (!currentUser) {
    throw new MeServiceError("User not found", 404);
  }

  const isPasswordValid = await comparePassword(
    input.passwordOld,
    currentUser.passwordHash,
  );

  if (!isPasswordValid) {
    throw new MeServiceError("Please enter valid password", 401);
  }
}

export async function updateMe(
  currentUserId: string,
  input: UpdateMeInput,
): Promise<{ user: MyProfileUser }> {
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

  await validatePassword(currentUserId, input);

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

  if (input.passwordNew !== undefined) {
    data.passwordHash = await hashPassword(input.passwordNew);
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

export async function getMe(
  userId: string,
): Promise<{ user: MyProfileUserWithStats }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: selfProfileSelect,
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const stats = await getFinishedGamesStats(user.id);
  return {
    user: toMyProfileUser(user, stats),
  };
}

export async function updateMeAvatar(
  userId: string,
  file?: Express.Multer.File,
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (!file) {
    throw new ApiError("Invalid file", 400);
  }

  const result = await cloudinary.uploadImage(file);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      avatarUrl: result.secure_url,
      avatarPublicId: result.public_id,
    },
  });
  return updatedUser.avatarUrl;
}
