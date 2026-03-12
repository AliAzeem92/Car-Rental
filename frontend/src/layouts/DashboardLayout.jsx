import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Car, Calendar, CalendarDays, Users, Wrench, Settings as SettingsIcon, LogOut } from 'lucide-react';
import MaintenanceBell from '../components/MaintenanceBell';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: t('navbar.dashboard'), icon: LayoutDashboard },
    { path: '/admin/cars', label: t('navbar.vehicles'), icon: Car },
    { path: '/admin/bookings', label: t('navbar.reservations'), icon: Calendar },
    { path: '/admin/planning', label: t('navbar.calendar'), icon: CalendarDays },
    { path: '/admin/customers', label: t('navbar.customers'), icon: Users },
    { path: '/admin/maintenance', label: t('navbar.maintenance'), icon: Wrench },
    { path: '/admin/settings', label: t('navbar.settings'), icon: SettingsIcon }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gradient-to-r from-[#081839] to-[#1b2a4f] text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold">🚗 {t('navbar.carRental')}</h1>
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
              {user?.role === 'ADMIN' ? t('navbar.administrator') : t('navbar.customer')}
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
            {t('navbar.logout')}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <LanguageSwitcher />
          <MaintenanceBell />
        </div>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
