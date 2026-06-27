// Libraries
import { randomUUID } from "node:crypto";
// Project level
import { prisma } from "lib/prisma";
import {
  hashPassword,
  comparePassword,
  hashRefreshToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getRefreshTokenLifetimeMs,
} from "utils";
import type { AuthSessionResponse, RefreshSessionResponse } from "types";
import type {
  RegisterResponse,
  RegisterRequestBody,
  LoginRequestBody,
  User,
} from "@exploding-cats/contracts";

export class AuthServiceError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function toUser(user: User): User {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl,
  };
}

const REFRESH_TOKEN_LIFETIME_MS = getRefreshTokenLifetimeMs();
const EXPIRED_SESSION_CLEANUP_INTERVAL_MS = 60_000;

let lastExpiredSessionCleanupAt = 0;

function getRefreshTokenExpiresAt(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_LIFETIME_MS);
}

export async function deleteExpiredRefreshSessions(): Promise<number> {
  const result = await prisma.userSession.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
  return result.count;
}

async function deleteExpiredRefreshSessionsIfDue(): Promise<void> {
  const now = Date.now();

  if (now - lastExpiredSessionCleanupAt < EXPIRED_SESSION_CLEANUP_INTERVAL_MS) {
    return;
  }

  lastExpiredSessionCleanupAt = now;

  await deleteExpiredRefreshSessions();
}

export async function registerUser(
  input: RegisterRequestBody,
): Promise<RegisterResponse> {
  const existingByEmail = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingByEmail) {
    throw new AuthServiceError("Email already in use", 409);
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      username: input.username,
      passwordHash,
    },
  });

  return {
    user: toUser(user),
  };
}

export async function loginUser(
  input: LoginRequestBody,
): Promise<AuthSessionResponse> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new AuthServiceError("Invalid email or password", 401);
  }

  const isPasswordValid = await comparePassword(
    input.password,
    user.passwordHash,
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
      expiresAt: getRefreshTokenExpiresAt(),
    },
  });

  const accessToken = signAccessToken({
    sub: user.id,
  });

  return {
    user: toUser(user),
    accessToken,
    refreshToken,
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
    where: { id: payload.sessionId },
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
    where: { id: session.id },
  });
}

export async function refreshSession(
  refreshToken: string,
): Promise<RefreshSessionResponse> {
  await deleteExpiredRefreshSessionsIfDue();

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AuthServiceError("Invalid refresh token", 401);
  }

  const session = await prisma.userSession.findUnique({
    where: { id: payload.sessionId },
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
      expiresAt: getRefreshTokenExpiresAt(),
    },
  });

  const newAccessToken = signAccessToken({
    sub: user.id,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}
