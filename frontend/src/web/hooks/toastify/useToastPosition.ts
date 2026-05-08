import { useEffect, useState } from "react";
import type { ToastPosition } from "react-toastify";

export const useToastPosition = (): ToastPosition => {
  const getPosition = (): ToastPosition =>
    window.innerWidth < 1440 ? "top-center" : "top-right";

  const [position, setPosition] = useState<ToastPosition>(getPosition);

  useEffect(() => {
    const handleResize = () => setPosition(getPosition());

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return position;
};
