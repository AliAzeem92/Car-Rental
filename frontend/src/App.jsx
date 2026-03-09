import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { MaintenanceProvider } from './context/MaintenanceContext';
import { FilterProvider } from './context/FilterContext';
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

// New customer-facing pages
import Home from './pages/Home';
import Cars from './pages/Cars';
import CustomerReservations from './pages/CustomerReservations';
import About from './pages/About';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <MaintenanceProvider>
            <FilterProvider>
              <Routes>
                {/* Customer-facing routes */}
                <Route path="/" element={<Home />} />
                <Route path="/cars" element={<Cars />} />
                <Route path="/reservations" element={<CustomerReservations />} />
                <Route path="/about" element={<About />} />
                
                {/* Redirect old customer portal to new home */}
                <Route 
                  path="/customer/portal" 
                  element={
                    <ProtectedRoute requiredRole="CUSTOMER">
                      <CustomerPortal />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Admin routes */}
                <Route path="/admin/login" element={<Login />} />
                <Route path="/admin/register" element={<Register />} />
                <Route path="/admin/forgot-password" element={<ForgotPassword />} />
                <Route 
                  path="/customer/portal/old" 
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
              </Routes>
            </FilterProvider>
          </MaintenanceProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
