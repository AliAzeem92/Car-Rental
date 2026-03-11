import { useEffect, useState, useRef } from 'react';
import { Bell, Wrench, Calendar, X } from 'lucide-react';
import { useMaintenanceAlerts } from '../context/MaintenanceContext';
import { useNavigate } from 'react-router-dom';
import { maintenanceAPI, reservationAPI } from '../services/api';

const MaintenanceBell = () => {
  const { alertCount, refreshAlertCount } = useMaintenanceAlerts();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    refreshAlertCount();
  }, [refreshAlertCount]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const [maintenanceRes, reservationsRes] = await Promise.all([
        maintenanceAPI.getAlerts(),
        reservationAPI.getAll({ status: 'PENDING' })
      ]);

      const maintenanceNotifications = (maintenanceRes.data || []).map(alert => ({
        id: `maintenance-${alert.id}`,
        type: 'maintenance',
        icon: Wrench,
        title: `${alert.type.replace('_', ' ')} Due`,
        message: `${alert.vehicle.brand} ${alert.vehicle.model} (${alert.vehicle.licensePlate})`,
        time: new Date(alert.dueDate).toLocaleDateString(),
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        link: '/admin/maintenance'
      }));

      const reservationNotifications = (reservationsRes.data || []).slice(0, 5).map(res => ({
        id: `reservation-${res.id}`,
        type: 'reservation',
        icon: Calendar,
        title: 'New Reservation',
        message: `${res.user?.firstName} ${res.user?.lastName} - ${res.vehicle?.brand} ${res.vehicle?.model}`,
        time: new Date(res.createdAt).toLocaleDateString(),
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        link: '/admin/bookings'
      }));

      setNotifications([...maintenanceNotifications, ...reservationNotifications]);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    if (!isOpen) {
      loadNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (link) => {
    setIsOpen(false);
    navigate(link);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition rounded-lg hover:bg-gray-100"
      >
        <Bell className="w-6 h-6" />
        {alertCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {alertCount > 9 ? '9+' : alertCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const Icon = notification.icon;
                  return (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.link)}
                      className="w-full p-4 hover:bg-gray-50 transition text-left flex items-start gap-3"
                    >
                      <div className={`${notification.bgColor} ${notification.color} p-2 rounded-lg flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm">{notification.title}</p>
                        <p className="text-gray-600 text-sm truncate">{notification.message}</p>
                        <p className="text-gray-400 text-xs mt-1">{notification.time}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/admin/maintenance');
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MaintenanceBell;
