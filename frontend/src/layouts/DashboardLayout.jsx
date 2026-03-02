import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Car, Calendar, CalendarDays, Users, Wrench, Settings as SettingsIcon, LogOut, Bell, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { planningAPI } from '../services/api';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      const { data } = await planningAPI.getMaintenanceAlerts();
      setAlerts(data || []);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const urgentAlerts = alerts.filter(alert => getDaysUntilDue(alert.dueDate) <= 7);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/vehicles', label: 'Vehicles', icon: Car },
    { path: '/dashboard/reservations', label: 'Reservations', icon: Calendar },
    { path: '/dashboard/planning', label: 'Planning', icon: CalendarDays },
    { path: '/dashboard/customers', label: 'Customers', icon: Users },
    { path: '/dashboard/maintenance', label: 'Maintenance', icon: Wrench },
    { path: '/dashboard/settings', label: 'Settings', icon: SettingsIcon }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gradient-to-r from-[#081839] to-[#1b2a4f] text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold">🚗 Car Rental</h1>
        </div>

        <div className="px-4 py-2 ">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-2xl overflow-hidden mb-3">
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <>{user?.firstName?.[0] || 'M'}{user?.lastName?.[0] || 'J'}</>
              )}
            </div>
            <div className="text-base font-semibold text-white">
              {user?.firstName || 'Michael'} {user?.lastName || 'Johnson'}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {user?.role === 'ADMIN' ? 'Administrator' : 'Customer'}
            </div>
          </div>
        </div>

        <nav className="flex-1 mt- px-3">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 mb-1 rounded-lg hover:bg-white/5 transition ${
                  location.pathname === item.path ? 'bg-[#1f2e54] text-white' : 'text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg transition flex items-center justify-center gap-2 font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-end items-center">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Bell className="w-6 h-6 text-gray-600" />
              {urgentAlerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 opacity-0 animate-in" style={{ animation: 'fade-in 0.2s ease-out forwards, slide-in-from-top 0.2s ease-out forwards' }}>
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Maintenance Alerts</h3>
                  <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-gray-100 rounded">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {urgentAlerts.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No urgent alerts</p>
                    </div>
                  ) : (
                    urgentAlerts.map(alert => {
                      const daysUntil = getDaysUntilDue(alert.dueDate);
                      const isOverdue = daysUntil < 0;
                      const typeLabel = alert.type === 'INSURANCE' ? 'Insurance' : alert.type === 'OIL_CHANGE' ? 'Oil Change' : 'Service';
                      
                      return (
                        <div key={alert.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition">
                          <div className="flex items-start gap-3">
                            <Car className={`w-5 h-5 mt-0.5 ${isOverdue ? 'text-red-600' : 'text-orange-600'}`} />
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">
                                {alert.vehicle.brand} {alert.vehicle.model}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {typeLabel} - {alert.vehicle.licensePlate}
                              </div>
                              <div className={`text-xs mt-1 font-medium ${isOverdue ? 'text-red-600' : 'text-orange-600'}`}>
                                {isOverdue ? `Overdue ${Math.abs(daysUntil)} days` : daysUntil === 0 ? 'Due today' : `Due in ${daysUntil} days`}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                {urgentAlerts.length > 0 && (
                  <div className="p-3 border-t border-gray-200">
                    <button
                      onClick={() => { setShowNotifications(false); navigate('/dashboard/maintenance'); }}
                      className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View All Alerts
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
