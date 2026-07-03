// Libraries
import { useEffect } from "react";
// Project level
import {
  connectToGameSession,
  setGameId,
  trackGameState,
  trackWaitingState,
} from "game/sockets";
// Local level
import { useSocket } from "./useSocket";

export function useGameSession(gameId: string) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!gameId) return;
    setGameId(gameId);
    const untrackWaitingState = trackWaitingState();
    const untrackGameState = trackGameState();
    const leaveRoom = connectToGameSession(socket, gameId);
    return () => {
      leaveRoom();
      untrackGameState();
      untrackWaitingState();
    };
  }, [socket, gameId]);
}
