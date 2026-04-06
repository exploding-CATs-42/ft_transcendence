/*
  Warnings:

  - You are about to drop the `game_moves` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `move_card` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "game_moves" DROP CONSTRAINT "game_moves_actor_user_id_fkey";

-- DropForeignKey
ALTER TABLE "game_moves" DROP CONSTRAINT "game_moves_game_id_fkey";

-- DropForeignKey
ALTER TABLE "move_card" DROP CONSTRAINT "move_card_card_id_fkey";

-- DropForeignKey
ALTER TABLE "move_card" DROP CONSTRAINT "move_card_move_id_fkey";

-- DropTable
DROP TABLE "game_moves";

-- DropTable
DROP TABLE "move_card";
