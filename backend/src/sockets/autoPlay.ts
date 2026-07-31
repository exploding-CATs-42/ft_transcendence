import {
  PlayerIdPayload,
  ServerPublicEvents,
  UserId,
} from "@exploding-cats/contracts";
import { Game, GameId } from "data/types";
import { isUserOnline } from "./onlineUsers";
import { GameRepository } from "data";
import { drawCard } from "services";
import { io } from "../app";
import { GameOutEvents } from "@exploding-cats/game-core";

const AUTO_PLAY_DELAY_MS = 60000;

const timers = new Map<UserId, NodeJS.Timeout>();

export const attachAutoPlay = (game: Game) => {
  game.instance.on(GameOutEvents.TURN_CHANGED, (event) => {
    startAutoPlay(game.id, event.payload.playerId);
  });
};

export const startAutoPlay = (gameId: GameId, playerId: UserId) => {
  if (isUserOnline(playerId)) return;

  cancelAutoPlay(playerId);
  timers.set(
    playerId,
    setTimeout(() => autoPlay(gameId, playerId), AUTO_PLAY_DELAY_MS),
  );
};

export const cancelAutoPlay = (playerId: UserId) => {
  const timer = timers.get(playerId);
  if (!timer) return;

  clearTimeout(timer);
  timers.delete(playerId);
};

export const startAutoPlayForCurrentTurnPlayer = (playerId: UserId) => {
  const game = GameRepository.findCurrentGameByUserId(playerId);
  if (!game) return;

  const { currentTurnPlayerId } = game.instance.getSnapshot().context;
  if (currentTurnPlayerId !== playerId) return;

  startAutoPlay(game.id, playerId);
};

export const autoPlay = async (gameId: GameId, playerId: UserId) => {
  if (isUserOnline(playerId)) return;

  const game = GameRepository.getGame(gameId);
  if (!game) return;

  const { currentTurnPlayerId } = game.instance.getSnapshot().context;
  if (currentTurnPlayerId !== playerId) return;

  try {
    await drawCard({ gameId }, playerId);

    const publicPayload: PlayerIdPayload = { playerId };

    io.to(gameId).emit(ServerPublicEvents.CARD_DRAWN, publicPayload);
  } catch (error) {
    console.log("Auto play could not draw a card: ", error);
  }
};
