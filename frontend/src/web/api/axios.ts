// Libraries
import axios from "axios";
// Project level
import { getErrorMessage } from "utils";

const { VITE_API_BASE_URL } = import.meta.env;

export const api = axios.create({
  baseURL: VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== "/users/refresh"
    ) {
      originalRequest._retry = true;

      const refreshResponse = await api.post("/users/refresh");
      const { accessToken } = refreshResponse.data;

      setAxiosToken(accessToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

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
