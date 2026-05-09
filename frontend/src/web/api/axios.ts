// Libraries
import axios from "axios";
// Project level
import { getErrorMessage } from "utils";

const { VITE_API_BASE_URL } = import.meta.env;

export const api = axios.create({
  baseURL: VITE_API_BASE_URL
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = getErrorMessage(error);
    return Promise.reject(new Error(message));
  }
);

export const setAxiosToken = (token: string) => {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
};
