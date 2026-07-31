import {
  PlayerIdPayload,
  ServerPublicEvents,
  UserId,
} from "@exploding-cats/contracts";
import { GameId } from "data/types";
import { isUserOnline } from "./onlineUsers";
import { GameRepository } from "data";
import { drawCard } from "services";
import { io } from "../app";

export const autoPlay = async (gameId: GameId, playerId: UserId) => {
  if (isUserOnline(playerId)) return;

  const game = GameRepository.getGame(gameId);
  if (!game) return;

  const { currentTurnPlayerId } = game.instance.getSnapshot().context;
  if (currentTurnPlayerId !== playerId) return;

  await drawCard({ gameId }, playerId);

  const publicPayload: PlayerIdPayload = { playerId };

  io.to(gameId).emit(ServerPublicEvents.CARD_DRAWN, publicPayload);
};
