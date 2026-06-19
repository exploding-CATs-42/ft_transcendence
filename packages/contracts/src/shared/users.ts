export type UserId = string;

export interface User {
  id: UserId;
  email: string;
  username: string;
  avatarUrl: string | null;
}

export type PublicUser = Omit<User, "email">;
