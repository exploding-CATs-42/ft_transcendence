// Libraries
import { useCallback, useEffect, type ReactNode } from "react";
// Project level
import { useLocalStorage } from "hooks";
import { AUTH_STORAGE_KEY } from "constants";
import {
  clearAccessTokenForRequests,
  saveAccessTokenForRequests,
  setAccessTokenRefreshHandler,
} from "api/axios";
// Local level
import { AuthContext, type AccessToken } from "./AuthContext";

type StoredAccessToken =
  | AccessToken
  | {
      accessToken?: AccessToken;
    }
  | null;

interface Props {
  children: ReactNode;
}

const getStoredAccessToken = (value: StoredAccessToken): AccessToken | null => {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value.accessToken === "string") {
    return value.accessToken;
  }

  return null;
};

const AuthProvider = ({ children }: Props) => {
  const [storedAccessToken, saveAccessToken] =
    useLocalStorage<StoredAccessToken>(AUTH_STORAGE_KEY, null);

  const accessToken = getStoredAccessToken(storedAccessToken);

  useEffect(() => {
    setAccessTokenRefreshHandler((accessToken) => {
      saveAccessToken({ accessToken });
    });

    return () => {
      setAccessTokenRefreshHandler(null);
    };
  }, [saveAccessToken]);

  const setAccessToken = useCallback(
    (accessToken: AccessToken) => {
      saveAccessTokenForRequests(accessToken);
      saveAccessToken({ accessToken });
    },
    [saveAccessToken],
  );

  const clearAccessToken = useCallback(() => {
    clearAccessTokenForRequests();
    saveAccessToken(null);
  }, [saveAccessToken]);

  return (
    <AuthContext.Provider
      value={{ accessToken, setAccessToken, clearAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
