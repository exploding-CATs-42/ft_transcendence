// Libraries
import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
// Project level
import { useAuth } from "hooks";

interface Props {
  children: ReactNode;
}

export const PublicRoute = ({ children }: Props) => {
  const { accessToken: isLoggedIn } = useAuth();
  const location = useLocation();

  return isLoggedIn ? <Navigate to={location.state?.from || "/"} /> : children;
};

export default PublicRoute;
