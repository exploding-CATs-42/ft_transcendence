/*
  Warnings:

  - Added the required column `game_name` to the `games` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "games" ADD COLUMN     "game_name" VARCHAR(255) NOT NULL;
