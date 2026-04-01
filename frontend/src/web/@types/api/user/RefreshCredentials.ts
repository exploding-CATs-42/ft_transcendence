import type { GenericAbortSignal } from "axios";

export type RefreshCredentials = {
  data: {
    refreshToken: string;
  };
  signal: GenericAbortSignal;
};
