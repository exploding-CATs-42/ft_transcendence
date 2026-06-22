// Libraries
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// Project level
import api from "api";
import { PhaserGame } from "components";
import { useGameSession } from "hooks";
import { EventBus } from "game/utils";
// Local level
import s from "./GamePage.module.css";

type GameLocationState = {
  gameId?: string;
};

const LEAVE_GAME_EVENT = "leave-game";

const GamePage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [gameId, setGameId] = useState(
    (state as GameLocationState | null)?.gameId ?? "",
  );
  const [ready, setReady] = useState(false);

  useGameSession(gameId);

  useEffect(() => {
    if (gameId) return;

    const loadCurrentGame = async () => {
      try {
        const currentGame = await api.games.getCurrent();

        if (!currentGame) {
          navigate("/lobby");
          return;
        }

        setGameId(currentGame.id);
      } catch (error) {
        console.error("Failed to load current game:", error);
        navigate("/lobby");
      }
    };

    void loadCurrentGame();
  }, [gameId, navigate]);

  useEffect(() => {
    const main = document.querySelector("main") as HTMLElement;

    if (!main) return;

    const prev = {
      overflow: main.style.overflow,
    };

    main.style.overflow = "hidden";
    // This error is disabled because in this specific case
    // the "unnecessary" rerender is actually "necessary"
    // and gives me the desired effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);

    return () => {
      main.style.overflow = prev.overflow;
    };
  }, []);

  const handleLeaveGame = useCallback(async () => {
    try {
      const currentGameId = gameId || (await api.games.getCurrent())?.id;

      if (currentGameId) {
        await api.games.leaveById(currentGameId);
      }

      navigate("/lobby");
    } catch (error) {
      console.error("Failed to leave game:", error);
    }
  }, [gameId, navigate]);

  useEffect(() => {
    EventBus.on(LEAVE_GAME_EVENT, handleLeaveGame);

    return () => {
      EventBus.off(LEAVE_GAME_EVENT, handleLeaveGame);
    };
  }, [handleLeaveGame]);

  if (!ready || !gameId) {
    return null;
  }

  return (
    <div className={s.gameContainer}>
      <PhaserGame />
    </div>
  );
};

export default GamePage;
