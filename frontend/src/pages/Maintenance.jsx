import { useState, useEffect } from 'react';
import { planningAPI } from '../services/api';

const Maintenance = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const { data } = await planningAPI.getMaintenanceAlerts();
      setAlerts(data);
    } catch (error) {
      alert('Failed to load maintenance alerts');
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getAlertColor = (daysUntil) => {
    if (daysUntil < 0) return 'bg-red-100 border-red-500 text-red-800';
    if (daysUntil <= 7) return 'bg-orange-100 border-orange-500 text-orange-800';
    return 'bg-yellow-100 border-yellow-500 text-yellow-800';
  };

  const typeLabels = {
    INSURANCE: '🛡️ Insurance',
    OIL_CHANGE: '🛢️ Oil Change',
    SERVICE: '🔧 Service'
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Maintenance Alerts</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alerts.map(alert => {
          const daysUntil = getDaysUntilDue(alert.dueDate);
          return (
            <div
              key={alert.id}
              className={`border-l-4 rounded-lg shadow p-6 ${getAlertColor(daysUntil)}`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold">
                  {alert.vehicle.brand} {alert.vehicle.model}
                </h3>
                <span className="text-2xl">{typeLabels[alert.type].split(' ')[0]}</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">License Plate:</span> {alert.vehicle.licensePlate}
                </p>
                <p>
                  <span className="font-semibold">Type:</span> {typeLabels[alert.type]}
                </p>
                <p>
                  <span className="font-semibold">Due Date:</span> {new Date(alert.dueDate).toLocaleDateString()}
                </p>
                <p className="font-bold text-lg mt-4">
                  {daysUntil < 0 ? (
                    <span className="text-red-600">⚠️ OVERDUE by {Math.abs(daysUntil)} days</span>
                  ) : daysUntil === 0 ? (
                    <span className="text-orange-600">⚠️ DUE TODAY</span>
                  ) : (
                    <span>Due in {daysUntil} days</span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {alerts.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <span className="text-6xl">✅</span>
          <h2 className="text-2xl font-bold mt-4 text-gray-700">All Clear!</h2>
          <p className="text-gray-600 mt-2">No maintenance alerts at this time.</p>
        </div>
      )}

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Maintenance Schedule Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded p-4">
            <h3 className="font-bold text-lg mb-2">🛡️ Insurance</h3>
            <p className="text-sm text-gray-600">Annual renewal required for all vehicles</p>
          </div>
          <div className="border rounded p-4">
            <h3 className="font-bold text-lg mb-2">🛢️ Oil Change</h3>
            <p className="text-sm text-gray-600">Every 5,000 km or 6 months</p>
          </div>
          <div className="border rounded p-4">
            <h3 className="font-bold text-lg mb-2">🔧 Service</h3>
            <p className="text-sm text-gray-600">Regular maintenance every 10,000 km</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
