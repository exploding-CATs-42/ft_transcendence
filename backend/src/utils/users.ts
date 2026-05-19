import { ApiError } from "../errors/apiError";
import { prisma } from "../lib/prisma";

export async function ensureUserExists(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true },
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }
  return user;
}
