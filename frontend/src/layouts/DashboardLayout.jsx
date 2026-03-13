import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Car,
  Calendar,
  CalendarDays,
  Users,
  Wrench,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import MaintenanceBell from '../components/MaintenanceBell';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useState } from 'react';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    { path: '/admin/settings', label: t('navbar.settings'), icon: SettingsIcon },
  ];

  // Get current page label for breadcrumb
  const currentPage = navItems.find((item) => item.path === location.pathname);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 xl:w-72 bg-gradient-to-b from-[#081839] via-[#0e2247] to-[#1b2a4f] text-white
          flex flex-col flex-shrink-0
          transition-transform duration-300 ease-in-out sidebar-transition
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Sidebar header */}
        <div className="px-5 py-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#d9b15c] rounded-lg flex items-center justify-center text-sm font-bold text-[#081839]">
              🚗
            </div>
            <h1 className="text-base xl:text-lg font-bold truncate">
              {t('navbar.carRental')}
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User avatar */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm overflow-hidden flex-shrink-0">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  {user?.firstName?.[0] || 'A'}
                  {user?.lastName?.[0] || 'D'}
                </>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.firstName || 'Admin'} {user?.lastName || ''}
              </p>
              <p className="text-xs text-blue-300 truncate">
                {user?.role === 'ADMIN' ? t('navbar.administrator') : t('navbar.customer')}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl
                  font-medium text-sm transition-all duration-150 group
                  ${
                    isActive
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-blue-200/80 hover:bg-white/8 hover:text-white'
                  }
                `}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-transform duration-150 ${
                    isActive ? 'text-[#d9b15c]' : 'group-hover:scale-110'
                  }`}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-[#d9b15c] flex-shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600/90 hover:bg-red-600 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            {t('navbar.logout')}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-auto min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger (mobile & tablet) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>

            {/* Page breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-sm min-w-0">
              <span className="text-gray-400 truncate">{t('navbar.carRental')}</span>
              <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              <span className="font-semibold text-gray-700 truncate">
                {currentPage?.label || 'Dashboard'}
              </span>
            </div>

            {/* Mobile: page label only */}
            <span className="sm:hidden font-semibold text-gray-800 text-sm truncate">
              {currentPage?.label || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <LanguageSwitcher />
            <MaintenanceBell />
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
