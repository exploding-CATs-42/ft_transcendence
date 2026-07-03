// Libraries
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ServerPrivateEvents } from "@exploding-cats/contracts";
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
  const navigate = useNavigate();

  useEffect(() => {
    if (!gameId) return;
    setGameId(gameId);
    const untrackWaitingState = trackWaitingState();
    const untrackGameState = trackGameState();
    const cleanupGameSession = connectToGameSession(socket, gameId);
    const handleLeftGame = () => {
      navigate("/lobby");
    };

    socket.on(ServerPrivateEvents.LEFT_GAME, handleLeftGame);

    return () => {
      socket.off(ServerPrivateEvents.LEFT_GAME, handleLeftGame);
      cleanupGameSession();
      untrackGameState();
      untrackWaitingState();
    };
  }, [socket, gameId, navigate]);
}
