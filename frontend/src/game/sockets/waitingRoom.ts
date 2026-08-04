import {
  ClientEvents,
  ServerPrivateEvents,
  ServerPublicEvents,
} from "@exploding-cats/contracts";
import { socket } from "socket";
import { emit, leaveGame } from "./gameSession";
import { hasCachedGameState } from "./gameRoom";
import {
  onCountdownCanceled,
  onCountdownStarted,
  onPlayerCanceled,
  onPlayerConfirmed,
  onPlayerDisconnected,
  onPlayerJoined,
  onPlayerLeft,
  onPlayerReconnected,
  onWaitingState,
  resetWaitingState,
} from "game/store";
import { Scenes } from "game/constants";

export const startWaitingRoomSession = () => {
  const subscriptions = [
    [ServerPrivateEvents.WAITING_STATE, onWaitingState],
    [ServerPublicEvents.PLAYER_JOINED, onPlayerJoined],
    [ServerPublicEvents.PLAYER_LEFT, onPlayerLeft],
    [ServerPublicEvents.PLAYER_CONFIRMED, onPlayerConfirmed],
    [ServerPublicEvents.PLAYER_CANCELED, onPlayerCanceled],
    [ServerPublicEvents.PLAYER_DISCONNECTED, onPlayerDisconnected],
    [ServerPublicEvents.PLAYER_RECONNECTED, onPlayerReconnected],
    [ServerPublicEvents.COUNTDOWN_STARTED, onCountdownStarted],
    [ServerPublicEvents.COUNTDOWN_CANCELED, onCountdownCanceled],
  ] as const;

  subscriptions.forEach(([event, handler]) => socket.on(event, handler));

  return () => {
    subscriptions.forEach(([event, handler]) => socket.off(event, handler));
    resetWaitingState();
  };
};

export const goToGameRoomWhenStarted = (scene: Phaser.Scene) => {
  const goToGameRoom = () => scene.scene.start(Scenes.GameRoom);

  socket.on(ServerPrivateEvents.GAME_STARTED, goToGameRoom);
  socket.on(ServerPrivateEvents.GAME_STATE, goToGameRoom);

  if (hasCachedGameState()) {
    goToGameRoom();
  }

  return () => {
    socket.off(ServerPrivateEvents.GAME_STARTED, goToGameRoom);
    socket.off(ServerPrivateEvents.GAME_STATE, goToGameRoom);
  };
};

export const confirmStart = () => emit(ClientEvents.CONFIRM_START);
export const cancelStart = () => emit(ClientEvents.CANCEL_START);

export const leaveWaitingGame = leaveGame;
