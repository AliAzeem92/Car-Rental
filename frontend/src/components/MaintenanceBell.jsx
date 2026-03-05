import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { maintenanceAPI } from '../services/api';

const MaintenanceBell = () => {
  const [alertCount, setAlertCount] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadAlerts();
    // Refresh alerts every 5 minutes
    const interval = setInterval(loadAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      const { data } = await maintenanceAPI.getAlerts();
      setAlerts(data);
      setAlertCount(data.length);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const typeConfig = {
    INSURANCE: { icon: '🛡️', label: 'Insurance Renewal' },
    OIL_CHANGE: { icon: '🛢️', label: 'Oil Change' },
    SERVICE: { icon: '🔧', label: 'Service' }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition"
      >
        <Bell className="w-6 h-6" />
        {alertCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {alertCount > 9 ? '9+' : alertCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Maintenance Alerts</h3>
            <p className="text-sm text-gray-600">{alertCount} active alert{alertCount !== 1 ? 's' : ''}</p>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No maintenance alerts
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{typeConfig[alert.type].icon}</span>
                    <span className="font-medium text-sm">{typeConfig[alert.type].label}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {alert.vehicle.brand} {alert.vehicle.model} - {alert.vehicle.licensePlate}
                  </div>
                  {alert.dueMileage && (
                    <div className="text-xs text-red-600 mt-1">
                      Due at {alert.dueMileage.toLocaleString()} km
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          {alerts.length > 0 && (
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  window.location.href = '/dashboard/maintenance';
                }}
                className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All Alerts
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MaintenanceBell;