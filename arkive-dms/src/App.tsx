import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "layouts/dashboard";
import AuthLayout from "layouts/auth";
import ProtectedRoute from "routes/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      {/* Public routes (redirect to dashboard if logged in) */}
      <Route element={<ProtectedRoute requiresAuth={false} />}>
        <Route path="auth/*" element={<AuthLayout />} />
      </Route>

      {/* Protected dashboard routes (redirect to auth if not logged in) */}
      <Route element={<ProtectedRoute requiresAuth={true} />}>
        <Route path="dashboard/*" element={<DashboardLayout />} />
      </Route>

      {/* Default Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
