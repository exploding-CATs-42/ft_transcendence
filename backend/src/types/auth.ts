export interface PublicUser {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ApiErrorResponse {
  message: string;
}

export interface ValidationErrorResponse {
  message: string;
  errors: {
    formErrors: string[];
    fieldErrors: Record<string, string[]>;
  };
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