import type { RefreshCredentials, UserCredentials } from "types";
import { api, setAxiosToken } from "../axios";

const register = async (credentials: UserCredentials) => {
  const result = await api.post("/users/register", credentials);
  return result.data;
};

const login = async (credentials: UserCredentials) => {
  const result = await api.post("/users/login", credentials);
  const { token } = result.data;

  setAxiosToken(token);
  return result.data;
};

const logout = async () => {
  await api.post("/users/logout");
  setAxiosToken("");
};

const refresh = async (credentials: RefreshCredentials) => {
  const result = await api.post("/users/refresh", credentials.data, {
    signal: credentials.signal
  });
  const { token } = result.data.result;

  setAxiosToken(token);
  return result.data.result;
};

export default {
  register,
  login,
  logout,
  refresh
};
