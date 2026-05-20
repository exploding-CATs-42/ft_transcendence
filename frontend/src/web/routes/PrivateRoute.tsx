// Libraries
import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
// Project level
import { useAuth } from "hooks";

interface Props {
  children: ReactNode;
}

const PrivateRoute = ({ children }: Props) => {
  const { accessToken: isLoggedIn } = useAuth();
  const location = useLocation();

  return isLoggedIn ? (
    children
  ) : (
    <Navigate state={{ from: location }} to={"/"} />
  );
};

export default PrivateRoute;
