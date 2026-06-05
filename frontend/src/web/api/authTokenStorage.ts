import { AUTH_STORAGE_KEY } from "constants";

type StoredAccessToken =
  | string
  | {
      accessToken?: string;
    }
  | null;

const parseStoredAccessToken = (value: StoredAccessToken): string | null => {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value.accessToken === "string") {
    return value.accessToken;
  }

  return null;
};

export const getStoredAccessToken = (): string | null => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);

    if (stored === null) {
      return null;
    }

    return parseStoredAccessToken(JSON.parse(stored) as StoredAccessToken);
  } catch {
    return null;
  }
};

export const saveStoredAccessToken = (accessToken: string) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ accessToken }));
};

export const clearStoredAccessToken = () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(null));
};
