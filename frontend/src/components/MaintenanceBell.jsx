import { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useMaintenanceAlerts } from '../context/MaintenanceContext';
import { useNavigate } from 'react-router-dom';

const MaintenanceBell = () => {
  const { alertCount, refreshAlertCount } = useMaintenanceAlerts();
  const navigate = useNavigate();

  useEffect(() => {
    refreshAlertCount();
  }, [refreshAlertCount]);

  return (
    <button
      onClick={() => navigate('/dashboard/maintenance')}
      className="relative p-2 text-gray-600 hover:text-gray-800 transition"
    >
      <Bell className="w-6 h-6" />
      {alertCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {alertCount > 9 ? '9+' : alertCount}
        </span>
      )}
    </button>
  );
};

export default MaintenanceBell;
