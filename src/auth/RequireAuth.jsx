import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireAuth({ allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return <div>Checking auth...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {

    if (role === "USER") {
      return <Navigate to="/user/dashboard" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
