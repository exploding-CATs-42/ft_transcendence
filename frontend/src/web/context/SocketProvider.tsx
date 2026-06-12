// Libraries
import { useEffect, type ReactNode } from "react";
// Project level
import { socket } from "socket";
import { useAuth } from "hooks";
// Local level
import { SocketContext } from "./SocketContext";

interface Props {
  children: ReactNode;
}

const SocketProvider = ({ children }: Props) => {
  const { authStatus, accessToken } = useAuth();

  useEffect(() => {
    if (authStatus === "authenticated") {
      socket.auth = {
        token: accessToken,
      };

      socket.connect();
    } else {
      socket.disconnect();
    }
  }, [accessToken, authStatus]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
