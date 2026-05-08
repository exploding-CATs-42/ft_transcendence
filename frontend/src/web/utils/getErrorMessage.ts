import axios, { AxiosError } from "axios";

export const getErrorMessage = (error: unknown): string => {
  const fallback = "Something went wrong";

  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback;
  }

  const { response, request, message } = error as AxiosError<{
    message?: string;
  }>;

  if (response) {
    return response.data?.message ?? `Error: ${response.status}`;
  }

  if (request) {
    return "No response from server";
  }

  return message || fallback;
};
