import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma";
import { hashPassword, comparePassword, hashRefreshToken } from "../utils/hash";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import type { AuthResponse, RefreshResponse } from "../types/auth";
import type { RegisterRequestBody } from "../schemas/users/registerSchema";
import type { LoginRequestBody } from "../schemas/users/loginSchema";
import type { LogoutRequestBody } from "../schemas/users/logoutSchema";
import type { RefreshRequestBody } from "../schemas/users/refreshSchema";

export class AuthServiceError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function toPublicUser(user: {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
}) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl,
  };
}

export async function registerUser(
  input: RegisterRequestBody
): Promise<AuthResponse> {
  const existingByEmail = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingByEmail) {
    throw new AuthServiceError("Email already in use", 409);
  }

  const existingByUsername = await prisma.user.findUnique({
    where: { username: input.username },
  });

  if (existingByUsername) {
    throw new AuthServiceError("Username already in use", 409);
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      username: input.username,
      passwordHash,
    },
  });

  const sessionId = randomUUID();
  const refreshToken = signRefreshToken({
    sub: user.id,
    sessionId,
  });

  const refreshTokenHash = hashRefreshToken(refreshToken);

  await prisma.userSession.create({
    data: {
      id: sessionId,
      userId: user.id,
      refreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    username: user.username,
  });

  return {
    user: toPublicUser(user),
    accessToken,
    refreshToken,
  };
}

export async function loginUser(
  input: LoginRequestBody
): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new AuthServiceError("Invalid email or password", 401);
  }

  const isPasswordValid = await comparePassword(
    input.password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new AuthServiceError("Invalid email or password", 401);
  }

  const sessionId = randomUUID();
  const refreshToken = signRefreshToken({
    sub: user.id,
    sessionId,
  });

  const refreshTokenHash = hashRefreshToken(refreshToken);

  await prisma.userSession.create({
    data: {
      id: sessionId,
      userId: user.id,
      refreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    username: user.username,
  });

  return {
    user: toPublicUser(user),
    accessToken,
    refreshToken,
  };
}

export async function logoutUser(
  input: LogoutRequestBody
): Promise<void> {
  let payload;

  try {
    payload = verifyRefreshToken(input.refreshToken);
  } catch {
    throw new AuthServiceError("Invalid refresh token", 401);
  }

  const session = await prisma.userSession.findUnique({
    where: { id: payload.sessionId },
  });

  if (!session) {
    throw new AuthServiceError("Session not found", 401);
  }

  const incomingHash = hashRefreshToken(input.refreshToken);

  if (session.refreshTokenHash !== incomingHash) {
    throw new AuthServiceError("Invalid refresh token", 401);
  }

  await prisma.userSession.delete({
    where: { id: session.id },
  });
}

export async function refreshSession(
  input: RefreshRequestBody
): Promise<RefreshResponse> {
  let payload;

  try {
    payload = verifyRefreshToken(input.refreshToken);
  } catch {
    throw new AuthServiceError("Invalid refresh token", 401);
  }

  const session = await prisma.userSession.findUnique({
    where: { id: payload.sessionId },
  });

  if (!session) {
    throw new AuthServiceError("Session not found", 401);
  }

  const incomingHash = hashRefreshToken(input.refreshToken);

  if (session.refreshTokenHash !== incomingHash) {
    throw new AuthServiceError("Invalid refresh token", 401);
  }

  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.userSession.delete({
      where: { id: session.id },
    });

    throw new AuthServiceError("Refresh token expired", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    throw new AuthServiceError("User not found", 404);
  }

  const newRefreshToken = signRefreshToken({
    sub: user.id,
    sessionId: session.id,
  });

  const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

  await prisma.userSession.update({
    where: { id: session.id },
    data: {
      refreshTokenHash: newRefreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const newAccessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    username: user.username,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}