import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { MaintenanceProvider } from "./context/MaintenanceContext";
import { FilterProvider } from "./context/FilterContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import CustomerRoute from "./components/CustomerRoute";
import GuestRoute from "./components/GuestRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import Reservations from "./pages/Reservations";
import Planning from "./pages/Planning";
import Customers from "./pages/Customers";
import Maintenance from "./pages/Maintenance";
import Settings from "./pages/Settings";
import CustomerDashboard from "./pages/CustomerDashboard";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <MaintenanceProvider>
            <FilterProvider>
              <Routes>
                {/* Public / Customer Dashboard entry */}
                <Route
                  path="/"
                  element={<Navigate to="/customer/dashboard" replace />}
                />

                {/* Guest-only routes */}
                <Route
                  path="/login"
                  element={
                    <GuestRoute>
                      <Login />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <GuestRoute>
                      <Register />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <GuestRoute>
                      <ForgotPassword />
                    </GuestRoute>
                  }
                />

                {/* Unified Customer Dashboard replaces all legacy navigation */}
                <Route
                  path="/customer/dashboard"
                  element={<CustomerDashboard />}
                />

                {/* Admin protected routes */}
                <Route
                  path="/admin"
                  element={<Navigate to="/admin/dashboard" replace />}
                />
                <Route
                  path="/admin/*"
                  element={
                    <AdminRoute>
                      <DashboardLayout />
                    </AdminRoute>
                  }
                >
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="cars" element={<Vehicles />} />
                  <Route path="bookings" element={<Reservations />} />
                  <Route path="planning" element={<Planning />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="maintenance" element={<Maintenance />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* Legacy redirects */}
                <Route
                  path="/dashboard"
                  element={<Navigate to="/admin/dashboard" replace />}
                />
                <Route
                  path="/dashboard/*"
                  element={<Navigate to="/admin/dashboard" replace />}
                />

                {/* Catch-all */}
                <Route
                  path="*"
                  element={<Navigate to="/customer/dashboard" replace />}
                />
              </Routes>
            </FilterProvider>
          </MaintenanceProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
