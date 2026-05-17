// Project level
import type { AccessToken } from "types";
// Local level
import { api, setAxiosToken } from "../axios";

export type RegisterReqBody = {
  username: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  user: {
    id: string;
    email: string;
    username: string;
    avatarUrl: string | null;
  };
  accessToken: AccessToken;
};

const register = async (body: RegisterReqBody): Promise<RegisterResponse> => {
  const result = await api.post("/users/register", body);
  return result.data;
};

export type UserCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = RegisterResponse;

const login = async (body: UserCredentials): Promise<LoginResponse> => {
  const result = await api.post("/users/login", body);
  const { token } = result.data;

  setAxiosToken(token);
  return result.data;
};

const logout = async () => {
  await api.post("/users/logout");
  setAxiosToken("");
};

const refresh = async () => {
  const result = await api.post("/users/refresh");
  const { accessToken } = result.data;

  setAxiosToken(accessToken);
  return result.data;
};

export default {
  register,
  login,
  logout,
  refresh,
};
