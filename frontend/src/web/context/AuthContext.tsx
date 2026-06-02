import { createContext } from "react";

export type AccessToken = string;

export interface AuthContextValue {
  accessToken: AccessToken | null;
  setAccessToken: (accessToken: AccessToken) => void;
  clearAccessToken: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
