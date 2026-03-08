import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { MaintenanceProvider } from './context/MaintenanceContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Reservations from './pages/Reservations';
import Planning from './pages/Planning';
import Customers from './pages/Customers';
import Maintenance from './pages/Maintenance';
import Settings from './pages/Settings';
import CustomerPortal from './pages/CustomerPortal';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <MaintenanceProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route 
                path="/customer/portal" 
                element={
                  <ProtectedRoute requiredRole="CUSTOMER">
                    <CustomerPortal />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="vehicles" element={<Vehicles />} />
                <Route path="reservations" element={<Reservations />} />
                <Route path="planning" element={<Planning />} />
                <Route path="customers" element={<Customers />} />
                <Route path="maintenance" element={<Maintenance />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </MaintenanceProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
