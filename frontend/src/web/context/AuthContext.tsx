import { createContext } from "react";
import { z } from "zod";

export type AccessToken = z.ZodUUID;

export interface AuthContextValue {
  accessToken: AccessToken | null;
  setAccessToken: (accessToken: AccessToken) => void;
  clearAccessToken: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
