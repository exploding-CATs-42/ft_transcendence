// Libraries
import { Navigate, Outlet, useLocation } from "react-router-dom";
// Project level
import { useAuth } from "hooks";

const AuthRoute = () => {
  const { authStatus } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  if (authStatus === "loading") {
    return null;
  }

  if (authStatus === "authenticated") {
    return <Navigate to={from || "/lobby"} replace />;
  }

  return <Outlet />;
};

export default AuthRoute;
