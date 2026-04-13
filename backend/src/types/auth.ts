export interface PublicUser {
    id: string;
    email: string;
    username: string;
    avatarUrl: string | null;
}

export interface RegisterResponse {
    user: PublicUser;
    accessToken: string;
    refreshToken: string;
}

export interface LoginResponse {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  username: string;
  type: "access";
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
  type: "refresh";
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
}

export interface RegisterRequestBody {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface LogoutRequestBody {
  refreshToken: string;
}

export interface RefreshRequestBody {
  refreshToken: string;
}