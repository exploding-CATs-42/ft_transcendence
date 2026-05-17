// Libraries
import { useCallback, type ReactNode } from "react";
// Project level
import { useLocalStorage } from "hooks";
import { AUTH_STORAGE_KEY } from "constants";
// Local level
import { AuthContext, type AccessToken } from "./AuthContext";

interface Props {
  children: ReactNode;
}

const AuthProvider = ({ children }: Props) => {
  const [accessToken, saveAccessToken] = useLocalStorage<AccessToken | null>(
    AUTH_STORAGE_KEY,
    null,
  );

  const setAccessToken = useCallback(
    (accessToken: AccessToken) => {
      saveAccessToken({ accessToken });
    },
    [saveAccessToken],
  );

  const clearAccessToken = useCallback(() => {
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
