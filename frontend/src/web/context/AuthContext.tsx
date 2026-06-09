import { createContext } from "react";

export type AccessToken = string;
export type AuthStatus =
  | "loading"
  | "authenticated"
  | "anonymous"
  | "unavailable";

export interface AuthContextValue {
  accessToken: AccessToken | null;
  authStatus: AuthStatus;
  setAccessToken: (accessToken: AccessToken) => void;
  clearAccessToken: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
