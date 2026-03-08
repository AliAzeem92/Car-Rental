import { createContext, useContext, useState, useCallback } from 'react';
import { vehicleAPI } from '../services/api';

const MaintenanceContext = createContext();

export const useMaintenanceAlerts = () => {
  const context = useContext(MaintenanceContext);
  if (!context) throw new Error('useMaintenanceAlerts must be used within MaintenanceProvider');
  return context;
};

export const MaintenanceProvider = ({ children }) => {
  const [alertCount, setAlertCount] = useState(0);

  const refreshAlertCount = useCallback(async () => {
    try {
      const response = await vehicleAPI.getAll();
      const vehicles = response.data;
      
      let count = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      vehicles.forEach((vehicle) => {
        vehicle.maintenance?.forEach((m) => {
          if (m.isDeleted || m.isCompleted) return;
          
          if (m.type === 'OIL_CHANGE') {
            if (m.dueMileage && vehicle.currentMileage >= m.dueMileage) count++;
          } else {
            const dueDate = new Date(m.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            if (today >= dueDate) count++;
          }
        });
      });

      setAlertCount(count);
    } catch (error) {
      console.error('Failed to refresh alert count:', error);
    }
  }, []);

  const value = {
    alertCount,
    refreshAlertCount
  };

  return <MaintenanceContext.Provider value={value}>{children}</MaintenanceContext.Provider>;
};
