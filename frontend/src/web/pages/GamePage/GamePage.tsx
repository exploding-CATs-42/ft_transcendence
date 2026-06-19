// Libraries
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
// Project level
import { PhaserGame } from "components";
import { useGameSession } from "hooks";

const GamePage = () => {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get("gameId") ?? "";
  const [ready, setReady] = useState(false);

  useGameSession(gameId);

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

  return <>{ready && <PhaserGame />}</>;
};

export default GamePage;
