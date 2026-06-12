// Libraries
import { useContext } from "react";
// Project level
import { SocketContext } from "context";

export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used within an SocketProvider");
  }

  return context;
};
