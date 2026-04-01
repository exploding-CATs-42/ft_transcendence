import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";

import { useAppSelector } from "../hooks";
import { selectIsLoggedIn } from "../redux";

type Props = {
  children: ReactNode;
};

export const PublicRoute = ({ children }: Props) => {
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const location = useLocation();

  return isLoggedIn ? <Navigate to={location.state?.from || "/"} /> : children;
};

export default PublicRoute;
