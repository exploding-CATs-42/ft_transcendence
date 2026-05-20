// Libraries
import { Navigate, Outlet, useLocation } from "react-router-dom";
// Project level
import { useAuth } from "hooks";

const PublicRoute = () => {
  const { accessToken: isLoggedIn } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  if (isLoggedIn) {
    return <Navigate to={from || "/lobby"} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
