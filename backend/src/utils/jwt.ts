import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import type { AccessTokenPayload, RefreshTokenPayload } from "../types/auth";

function getEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

const jwtAccessSecret = getEnv("JWT_ACCESS_SECRET");
const jwtRefreshSecret = getEnv("JWT_REFRESH_SECRET");
const jwtAccessExpiresIn = getEnv("JWT_ACCESS_EXPIRES_IN");
const jwtRefreshExpiresIn = getEnv("JWT_REFRESH_EXPIRES_IN");

export function signAccessToken(payload: { sub: string }): string {
  return jwt.sign(
    {
      sub: payload.sub,
      type: "access"
    },
    jwtAccessSecret,
    { expiresIn: jwtAccessExpiresIn } as SignOptions
  );
}

export function signRefreshToken(payload: {
  sub: string;
  sessionId: string;
}): string {
  return jwt.sign(
    {
      sub: payload.sub,
      sessionId: payload.sessionId,
      type: "refresh"
    },
    jwtRefreshSecret,
    { expiresIn: jwtRefreshExpiresIn } as SignOptions
  );
}

function isJwtObject(decoded: string | JwtPayload): decoded is JwtPayload {
  return typeof decoded === "object" && decoded !== null;
}

function isAccessTokenPayload(
  decoded: string | JwtPayload
): decoded is AccessTokenPayload {
  return (
    isJwtObject(decoded) &&
    typeof decoded.sub === "string" &&
    decoded["type"] === "access"
  );
}

function isRefreshTokenPayload(
  decoded: string | JwtPayload
): decoded is RefreshTokenPayload {
  return (
    isJwtObject(decoded) &&
    typeof decoded.sub === "string" &&
    typeof decoded["sessionId"] === "string" &&
    decoded["type"] === "refresh"
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, jwtAccessSecret);

  if (!isAccessTokenPayload(decoded)) {
    throw new Error("Invalid access token payload");
  }

  return decoded;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, jwtRefreshSecret);

  if (!isRefreshTokenPayload(decoded)) {
    throw new Error("Invalid refresh token payload");
  }

  return decoded;
}
