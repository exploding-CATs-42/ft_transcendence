// Project level
import { prisma } from "lib/prisma";

export async function ensureDatabaseConnection() {
  await prisma.$connect();
  await prisma.$queryRaw`SELECT 1`;
}
