// Libraries
import { type ReactNode } from "react";
// Project level
import { socket } from "socket";
// Local level
import { SocketContext } from "./SocketContext";

interface Props {
  children: ReactNode;
}

const SocketProvider = ({ children }: Props) => {
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
