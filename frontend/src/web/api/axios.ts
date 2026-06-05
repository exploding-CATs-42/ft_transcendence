// Libraries
import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
// Project level
import { getErrorMessage } from "utils";
// Local level
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  saveStoredAccessToken,
} from "./authTokenStorage";

const { VITE_API_BASE_URL } = import.meta.env;

type RetriableAxiosRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let authVersion = 0;
let onAccessTokenRefresh: ((accessToken: string) => void) | null = null;

export const api = axios.create({
  baseURL: VITE_API_BASE_URL,
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async () => {
  const refreshResponse = await api.post("/users/refresh");
  const { accessToken } = refreshResponse.data;

  return accessToken;
};

api.interceptors.request.use((config) => {
  const accessToken = getStoredAccessToken();

  config.headers = AxiosHeaders.from(config.headers);

  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  } else {
    config.headers.delete("Authorization");
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config as
      | RetriableAxiosRequestConfig
      | undefined;
    const requestUrl = originalRequest?.url;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      requestUrl !== "/users/refresh" &&
      requestUrl !== "/users/logout" &&
      requestUrl !== "/users/login"
    ) {
      originalRequest._retry = true;

      const refreshAuthVersion = authVersion;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const accessToken = await refreshPromise;

      if (refreshAuthVersion !== authVersion) {
        return Promise.reject(error);
      }

      saveStoredAccessToken(accessToken);
      onAccessTokenRefresh?.(accessToken);

      originalRequest.headers = AxiosHeaders.from(originalRequest.headers);
      originalRequest.headers.set("Authorization", `Bearer ${accessToken}`);

      return api(originalRequest);
    }

    const message = getErrorMessage(error);

    return Promise.reject({
      ...error,
      message,
    });
  },
);

export const saveAccessTokenForRequests = (token: string) => {
  saveStoredAccessToken(token);
};

export const clearAccessTokenForRequests = () => {
  authVersion += 1;
  clearStoredAccessToken();
};

export const setAccessTokenRefreshHandler = (
  handler: ((accessToken: string) => void) | null,
) => {
  onAccessTokenRefresh = handler;
};
