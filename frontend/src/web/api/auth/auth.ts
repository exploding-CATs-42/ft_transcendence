// Project level
import type {
  RegisterRequestBody,
  RegisterResponse,
  LoginResponse,
  AccessToken,
} from "@exploding-cats/contracts";
// Local level
import {
  api,
  clearAccessTokenForRequests,
  saveAccessTokenForRequests,
} from "../axios";

const register = async (
  body: RegisterRequestBody,
): Promise<RegisterResponse> => {
  const result = await api.post("/auth/register", body);
  return result.data;
};

export type UserCredentials = {
  email: string;
  password: string;
};

const login = async (body: UserCredentials): Promise<LoginResponse> => {
  const result = await api.post("/auth/login", body);
  const { accessToken } = result.data;

  saveAccessTokenForRequests(accessToken);
  return result.data;
};

const logout = async () => {
  try {
    await api.post("/auth/logout");
  } finally {
    clearAccessTokenForRequests();
  }
};

export type RefreshResponse = {
  accessToken: AccessToken;
};

const refresh = async (): Promise<RefreshResponse> => {
  const result = await api.post("/auth/refresh");
  const { accessToken } = result.data;

  saveAccessTokenForRequests(accessToken);
  return result.data;
};

export default {
  register,
  login,
  logout,
  refresh,
};
