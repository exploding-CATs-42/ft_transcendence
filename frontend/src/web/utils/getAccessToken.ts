import { AUTH_STORAGE_KEY } from "constants";

export const getAccessToken = (): string | null => {
  const keys = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!keys) return null;

  return JSON.parse(keys)?.accessToken ?? null;
};
