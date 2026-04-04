/*
  Warnings:

  - You are about to drop the column `sequence_number` on the `game_moves` table. All the data in the column will be lost.
  - You are about to drop the column `players_json` on the `games` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "game_moves_game_id_sequence_number_key";

-- AlterTable
ALTER TABLE "game_moves" DROP COLUMN "sequence_number";

-- AlterTable
ALTER TABLE "games" DROP COLUMN "players_json";
