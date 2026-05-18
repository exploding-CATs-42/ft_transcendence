// Libraries
import { useEffect, useState } from "react";
// Project level
import { PhaserGame } from "components";

const GamePage = () => {
  const [ready, setReady] = useState(false);

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
