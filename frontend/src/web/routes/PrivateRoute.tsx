import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";

import { useAppSelector } from "../hooks";
import { selectIsLoggedIn } from "../redux";

interface Props {
  children: ReactNode;
}

const PrivateRoute = ({ children }: Props) => {
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const location = useLocation();

  return isLoggedIn ? (
    children
  ) : (
    <Navigate state={{ from: location }} to={"/"} />
  );
};

export default PrivateRoute;
