import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "views/auth/stores/auth.store";

const ProtectedRoute = ({ requiresAuth }: { requiresAuth: boolean }) => {
  const user = useAuthStore((state) => state.user);

  if (requiresAuth && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (!requiresAuth && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
