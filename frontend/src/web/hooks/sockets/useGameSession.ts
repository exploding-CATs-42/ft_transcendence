import {
  connectToGameSession,
  setGameId,
  trackWaitingState,
} from "game/sockets";
import { useEffect } from "react";
import { useSocket } from "./useSocket";

export function useGameSession(gameId: string) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!gameId) return;
    setGameId(gameId);
    const stopCache = trackWaitingState();
    const leaveRoom = connectToGameSession(socket, gameId);
    return () => {
      leaveRoom();
      stopCache();
    };
  }, [socket, gameId]);
}
