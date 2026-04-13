import jwt from "jsonwebtoken";
import type {
  AccessTokenPayload,
  RefreshTokenPayload,
} from "../types/auth";

const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
} = process.env;

if (!JWT_ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET is not set");
}

if (!JWT_REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET is not set");
}

if (!JWT_ACCESS_EXPIRES_IN) {
  throw new Error("JWT_ACCESS_EXPIRES_IN is not set");
}

if (!JWT_REFRESH_EXPIRES_IN) {
  throw new Error("JWT_REFRESH_EXPIRES_IN is not set");
}

export function signAccessToken(payload: {
  sub: string;
  email: string;
  username: string;
}): string {
  return jwt.sign(
    {
      sub: payload.sub,
      email: payload.email,
      username: payload.username,
      type: "access",
    },
    JWT_ACCESS_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRES_IN } as jwt.SignOptions
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
      type: "refresh",
    },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, JWT_ACCESS_SECRET) as AccessTokenPayload;

  if (payload.type !== "access") {
    throw new Error("Invalid access token type");
  }

  return payload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;

  if (payload.type !== "refresh") {
    throw new Error("Invalid refresh token type");
  }

  return payload;
}