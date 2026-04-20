/*
  Warnings:

  - The values [BLOCKED] on the enum `friendship_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "friendship_status_new" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');
ALTER TABLE "friendships" ALTER COLUMN "status" TYPE "friendship_status_new" USING ("status"::text::"friendship_status_new");
ALTER TYPE "friendship_status" RENAME TO "friendship_status_old";
ALTER TYPE "friendship_status_new" RENAME TO "friendship_status";
DROP TYPE "public"."friendship_status_old";
COMMIT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_online" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_seen_at" TIMESTAMP(3);
