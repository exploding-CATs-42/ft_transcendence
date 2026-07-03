import type { AuthenticatedUser } from "./auth";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
    interface Socket {
      user?: AuthenticatedUser;
    }
  }
}

export {};
