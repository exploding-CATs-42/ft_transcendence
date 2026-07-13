import {
  ClientEvents,
  ServerPrivateEvents,
  ServerPublicEvents,
  type CountdownStartedPayload,
  type GameStartedPayload,
  type GameStatePayload,
  type PlayerIdPayload,
  type PlayerJoinedPayload,
  type WaitingPlayerView,
  type WaitingStatePayload,
} from "@exploding-cats/contracts";
import { socket } from "socket";
import { emit, leaveGame } from "./gameSession";
import { hasCachedGameState } from "./gameRoom";

export interface WaitingRoomHandlers {
  onWaitingState(players: WaitingPlayerView[], isConfirmed: boolean): void;
  onPlayerJoined(player: WaitingPlayerView): void;
  onPlayerLeft(playerId: string): void;
  onPlayerConfirmed(playerId: string): void;
  onPlayerCanceled(playerId: string): void;
  onCountdownStarted(endsAt: number): void;
  onCountdownCanceled(): void;
  onGameStarted(payload?: GameStartedPayload | GameStatePayload): void;
}

let lastWaitingState: WaitingStatePayload | null = null;

export function trackWaitingState(): () => void {
  const cache = (p: WaitingStatePayload) => {
    lastWaitingState = p;
  };
  socket.on(ServerPrivateEvents.WAITING_STATE, cache);
  return () => {
    socket.off(ServerPrivateEvents.WAITING_STATE, cache);
    lastWaitingState = null;
  };
}

export function subscribeWaitingRoom(
  handlers: WaitingRoomHandlers,
): () => void {
  const onWaitingState = (p: WaitingStatePayload) =>
    handlers.onWaitingState(p.waitingState.players, p.meConfirmed);
  const onPlayerJoined = (p: PlayerJoinedPayload) =>
    handlers.onPlayerJoined(p.player);
  const onPlayerLeft = (p: PlayerIdPayload) =>
    handlers.onPlayerLeft(p.playerId);
  const onPlayerConfirmed = (p: PlayerIdPayload) =>
    handlers.onPlayerConfirmed(p.playerId);
  const onPlayerCanceled = (p: PlayerIdPayload) =>
    handlers.onPlayerCanceled(p.playerId);
  const onCountdownStarted = (p: CountdownStartedPayload) =>
    handlers.onCountdownStarted(p.endsAt);
  const onCountdownCanceled = () => handlers.onCountdownCanceled();
  const onGameStarted = (p: GameStartedPayload) => handlers.onGameStarted(p);
  const onGameState = (p: GameStatePayload) => handlers.onGameStarted(p);

  socket.on(ServerPrivateEvents.WAITING_STATE, onWaitingState);
  socket.on(ServerPrivateEvents.GAME_STATE, onGameState);
  socket.on(ServerPublicEvents.PLAYER_JOINED, onPlayerJoined);
  socket.on(ServerPublicEvents.PLAYER_LEFT, onPlayerLeft);
  socket.on(ServerPublicEvents.PLAYER_CONFIRMED, onPlayerConfirmed);
  socket.on(ServerPublicEvents.PLAYER_CANCELED, onPlayerCanceled);
  socket.on(ServerPublicEvents.COUNTDOWN_STARTED, onCountdownStarted);
  socket.on(ServerPublicEvents.COUNTDOWN_CANCELED, onCountdownCanceled);
  socket.on(ServerPrivateEvents.GAME_STARTED, onGameStarted);

  if (lastWaitingState)
    handlers.onWaitingState(
      lastWaitingState.waitingState.players,
      lastWaitingState.meConfirmed,
    );
  if (hasCachedGameState()) handlers.onGameStarted();

  return () => {
    socket.off(ServerPrivateEvents.WAITING_STATE, onWaitingState);
    socket.off(ServerPrivateEvents.GAME_STATE, onGameState);
    socket.off(ServerPublicEvents.PLAYER_JOINED, onPlayerJoined);
    socket.off(ServerPublicEvents.PLAYER_LEFT, onPlayerLeft);
    socket.off(ServerPublicEvents.PLAYER_CONFIRMED, onPlayerConfirmed);
    socket.off(ServerPublicEvents.PLAYER_CANCELED, onPlayerCanceled);
    socket.off(ServerPublicEvents.COUNTDOWN_STARTED, onCountdownStarted);
    socket.off(ServerPublicEvents.COUNTDOWN_CANCELED, onCountdownCanceled);
    socket.off(ServerPrivateEvents.GAME_STARTED, onGameStarted);
  };
}

export const confirmStart = () => emit(ClientEvents.CONFIRM_START);
export const cancelStart = () => emit(ClientEvents.CANCEL_START);
export const leaveWaitingGame = leaveGame;
