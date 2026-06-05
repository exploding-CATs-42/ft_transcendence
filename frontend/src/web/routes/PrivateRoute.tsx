// Libraries
import { Navigate, Outlet, useLocation } from "react-router-dom";
// Project level
import { useAuth } from "hooks";

const PrivateRoute = () => {
  const { authStatus } = useAuth();
  const location = useLocation();

  if (authStatus === "loading") {
    return null;
  }

  if (authStatus === "anonymous") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
