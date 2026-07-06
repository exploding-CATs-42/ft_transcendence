// Project level
import { Prisma } from "generated/prisma/client";

export const publicProfileSelect = {
  id: true,
  username: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

export const selfProfileSelect = {
  id: true,
  email: true,
  username: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;
