// Libraries
import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
// Project level
import { getErrorMessage } from "utils";

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

      setAxiosToken(accessToken);
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

export const setAxiosToken = (token: string) => {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const clearAxiosToken = () => {
  authVersion += 1;
  delete api.defaults.headers.common.Authorization;
};

export const setAccessTokenRefreshHandler = (
  handler: ((accessToken: string) => void) | null,
) => {
  onAccessTokenRefresh = handler;
};
