// Libraries
import { useEffect } from "react";
// Project level
import { connectToGameSession, setGameId } from "game/sockets";
// Local level
import { useSocket } from "./useSocket";

export function useGameSession(gameId: string) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!gameId) return;
    setGameId(gameId);
    const leaveRoom = connectToGameSession(socket, gameId);
    return () => {
      leaveRoom();
    };
  }, [socket, gameId]);
}
