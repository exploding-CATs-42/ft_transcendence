import { PublicUser, User } from "@exploding-cats/contracts";
import { Request } from "express";

export interface RegisterResponse {
  user: PublicUser;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface AuthSessionResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshSessionResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AccessTokenPayload {
  sub: string;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
  type: "refresh";
}

export interface AuthenticatedUser {
  id: string;
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}
