import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma";
import { hashPassword, comparePassword, hashRefreshToken } from "../utils/hash";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "../utils/jwt";
import { getRefreshTokenLifetimeMs } from "../utils/tokenLifetime";
import type {
  AuthSessionResponse,
  RefreshSessionResponse,
  PublicUser
} from "../types/auth";
import type { RegisterRequestBody } from "../schemas/users/registerSchema";
import type { LoginRequestBody } from "../schemas/users/loginSchema";

export class AuthServiceError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function toPublicUser(user: PublicUser): PublicUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl
  };
}

const REFRESH_TOKEN_LIFETIME_MS = getRefreshTokenLifetimeMs();

function getRefreshTokenExpiresAt(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_LIFETIME_MS);
}

export async function registerUser(
  input: RegisterRequestBody
): Promise<AuthSessionResponse> {
  const existingByEmail = await prisma.user.findUnique({
    where: { email: input.email }
  });

  if (existingByEmail) {
    throw new AuthServiceError("Email already in use", 409);
  }

  const existingByUsername = await prisma.user.findUnique({
    where: { username: input.username }
  });

  if (existingByUsername) {
    throw new AuthServiceError("Username already in use", 409);
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      username: input.username,
      passwordHash
    }
  });

  const sessionId = randomUUID();
  const refreshToken = signRefreshToken({
    sub: user.id,
    sessionId
  });

  const refreshTokenHash = hashRefreshToken(refreshToken);

  await prisma.userSession.create({
    data: {
      id: sessionId,
      userId: user.id,
      refreshTokenHash,
      expiresAt: getRefreshTokenExpiresAt()
    }
  });

  const accessToken = signAccessToken({
    sub: user.id
  });

  return {
    user: toPublicUser(user),
    accessToken,
    refreshToken
  };
}

export async function loginUser(
  input: LoginRequestBody
): Promise<AuthSessionResponse> {
  const user = await prisma.user.findUnique({
    where: { email: input.email }
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
    sessionId
  });

  const refreshTokenHash = hashRefreshToken(refreshToken);

  await prisma.userSession.create({
    data: {
      id: sessionId,
      userId: user.id,
      refreshTokenHash,
      expiresAt: getRefreshTokenExpiresAt()
    }
  });

  const accessToken = signAccessToken({
    sub: user.id
  });

  return {
    user: toPublicUser(user),
    accessToken,
    refreshToken
  };
}

export async function logoutUser(refreshToken: string): Promise<void> {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AuthServiceError("Invalid refresh token", 401);
  }

  const session = await prisma.userSession.findUnique({
    where: { id: payload.sessionId }
  });

  if (!session) {
    throw new AuthServiceError("Session not found", 401);
  }

  if (session.userId !== payload.sub) {
    throw new AuthServiceError("Invalid refresh token", 401);
  }

  const incomingHash = hashRefreshToken(refreshToken);

  if (session.refreshTokenHash !== incomingHash) {
    throw new AuthServiceError("Invalid refresh token", 401);
  }

  await prisma.userSession.delete({
    where: { id: session.id }
  });
}

export async function refreshSession(
  refreshToken: string
): Promise<RefreshSessionResponse> {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AuthServiceError("Invalid refresh token", 401);
  }

  const session = await prisma.userSession.findUnique({
    where: { id: payload.sessionId }
  });

  if (!session) {
    throw new AuthServiceError("Session not found", 401);
  }

  if (session.userId !== payload.sub) {
    throw new AuthServiceError("Invalid refresh token", 401);
  }

  const incomingHash = hashRefreshToken(refreshToken);

  if (session.refreshTokenHash !== incomingHash) {
    throw new AuthServiceError("Invalid refresh token", 401);
  }

  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.userSession.delete({
      where: { id: session.id }
    });

    throw new AuthServiceError("Refresh token expired", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId }
  });

  if (!user) {
    throw new AuthServiceError("User not found", 404);
  }

  const newRefreshToken = signRefreshToken({
    sub: user.id,
    sessionId: session.id
  });

  const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

  await prisma.userSession.update({
    where: { id: session.id },
    data: {
      refreshTokenHash: newRefreshTokenHash,
      expiresAt: getRefreshTokenExpiresAt()
    }
  });

  const newAccessToken = signAccessToken({
    sub: user.id
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
}
