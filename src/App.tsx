import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

// Student
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentNotifications from "@/pages/student/StudentNotifications";
import StudentLayout from "@/components/layout/StudentLayout";

// Driver
import DriverDashboard from "./pages/driver/DriverDashboard";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBusDetails from "./pages/admin/AdminBusDetails";
import AdminBusTrack from "./pages/admin/AdminBusTrack";

const queryClient = new QueryClient();

/* ===================== PROTECTED ROUTE ===================== */

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <>{children}</>;
}

/* ===================== ROUTES ===================== */

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to={`/${user?.role}`} /> : <Index />}
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={`/${user?.role}`} /> : <LoginPage />}
      />

      {/* STUDENT ROUTES */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="notifications" element={<StudentNotifications />} />
      </Route>

      {/* DRIVER ROUTES */}
      <Route
        path="/driver"
        element={
          <ProtectedRoute allowedRoles={["driver"]}>
            <DriverDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/driver/*"
        element={
          <ProtectedRoute allowedRoles={["driver"]}>
            <DriverDashboard />
          </ProtectedRoute>
        }
      />

      {/* ADMIN ROUTES */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bus/:busId"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminBusDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bus/:busId/track"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminBusTrack />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

/* ===================== APP ===================== */

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
