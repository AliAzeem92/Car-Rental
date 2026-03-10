import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { MaintenanceProvider } from './context/MaintenanceContext';
import { FilterProvider } from './context/FilterContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import GuestRoute from './components/GuestRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Reservations from './pages/Reservations';
import Customers from './pages/Customers';
import Maintenance from './pages/Maintenance';
import Settings from './pages/Settings';
import CustomerPortal from './pages/CustomerPortal';

// Customer-facing pages
import Home from './pages/Home';
import CarsPage from './pages/CarsPage';
import CarDetailPage from './pages/CarDetailPage';
import BookingPage from './pages/BookingPage';
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
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/cars" element={<CarsPage />} />
                <Route path="/cars/:id" element={<CarDetailPage />} />
                <Route path="/about" element={<About />} />
                
                {/* Guest-only routes */}
                <Route path="/login" element={
                  <GuestRoute>
                    <Login />
                  </GuestRoute>
                } />
                
                {/* Protected routes */}
                <Route path="/booking/:carId" element={
                  <ProtectedRoute>
                    <BookingPage />
                  </ProtectedRoute>
                } />
                
                {/* Customer protected routes */}
                <Route path="/reservations" element={
                  <ProtectedRoute requiredRole="CUSTOMER">
                    <CustomerReservations />
                  </ProtectedRoute>
                } />
                <Route path="/customer/portal" element={
                  <ProtectedRoute requiredRole="CUSTOMER">
                    <CustomerPortal />
                  </ProtectedRoute>
                } />
                
                {/* Admin protected routes */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/*" element={
                  <AdminRoute>
                    <DashboardLayout />
                  </AdminRoute>
                }>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="cars" element={<Vehicles />} />
                  <Route path="bookings" element={<Reservations />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="maintenance" element={<Maintenance />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
                
                {/* Legacy redirects */}
                <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/dashboard/*" element={<Navigate to="/admin/dashboard" replace />} />
                
                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </FilterProvider>
          </MaintenanceProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
