import {
  PlayerIdPayload,
  ServerPublicEvents,
  UserId,
} from "@exploding-cats/contracts";
import { GameRepository } from "data";
import { io } from "../../app";

function broadcastToCurrentGame(userId: UserId, event: string) {
  const game = GameRepository.findCurrentGameByUserId(userId);
  if (!game) return;

  const payload: PlayerIdPayload = { playerId: userId };
  io.to(game.id).emit(event, payload);
}

export function broadcastPlayerDisconnected(userId: UserId) {
  broadcastToCurrentGame(userId, ServerPublicEvents.PLAYER_DISCONNECTED);
}

export function broadcastPlayerReconnected(userId: UserId) {
  broadcastToCurrentGame(userId, ServerPublicEvents.PLAYER_RECONNECTED);
}
