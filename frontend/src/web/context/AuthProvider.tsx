// Libraries
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
// Project level
import { useLocalStorage } from "hooks";
import { AUTH_STORAGE_KEY } from "constants";
import {
  api,
  clearAccessTokenForRequests,
  saveAccessTokenForRequests,
  setAccessTokenRefreshHandler,
  setSessionExpiredHandler,
} from "api/axios";
// Local level
import { AuthContext, type AccessToken, type AuthStatus } from "./AuthContext";

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
  const initialAccessTokenRef = useRef(accessToken);
  const [authStatus, setAuthStatus] = useState<AuthStatus>(
    accessToken ? "loading" : "anonymous",
  );

  const setAccessToken = useCallback(
    (accessToken: AccessToken) => {
      saveAccessTokenForRequests(accessToken);
      saveAccessToken({ accessToken });
      setAuthStatus("authenticated");
    },
    [saveAccessToken],
  );

  const clearAccessToken = useCallback(() => {
    clearAccessTokenForRequests();
    saveAccessToken(null);
    setAuthStatus("anonymous");
  }, [saveAccessToken]);

  useEffect(() => {
    setAccessTokenRefreshHandler((accessToken) => {
      saveAccessToken({ accessToken });
      setAuthStatus("authenticated");
    });

    setSessionExpiredHandler(() => {
      saveAccessToken(null);
      setAuthStatus("anonymous");
    });

    return () => {
      setAccessTokenRefreshHandler(null);
      setSessionExpiredHandler(null);
    };
  }, [saveAccessToken]);

  useEffect(() => {
    let isActive = true;

    const restoreSession = async () => {
      if (!initialAccessTokenRef.current) {
        setAuthStatus("anonymous");
        return;
      }

      try {
        const result = await api.post<{ accessToken: AccessToken }>(
          "/users/refresh",
        );

        if (!isActive) return;

        setAccessToken(result.data.accessToken);
      } catch {
        if (!isActive) return;

        clearAccessToken();
      }
    };

    void restoreSession();

    return () => {
      isActive = false;
    };
  }, [clearAccessToken, setAccessToken]);

  return (
    <AuthContext.Provider
      value={{ accessToken, authStatus, setAccessToken, clearAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
