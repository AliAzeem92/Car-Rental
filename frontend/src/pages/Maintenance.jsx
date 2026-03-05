import { useState, useEffect } from 'react';
import { AlertTriangle, Calendar, Car, CheckCircle2 } from 'lucide-react';
import { vehicleAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const Maintenance = () => {
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await vehicleAPI.getAll();
      const vehicles = response.data;
      console.log('All vehicles:', vehicles);
      const generatedAlerts = [];
      const today = new Date();
      console.log('Today:', today);

      vehicles.forEach(vehicle => {
        console.log('Checking vehicle:', vehicle.id, {
          currentMileage: vehicle.currentMileage,
          nextOilChangeMileage: vehicle.nextOilChangeMileage,
          nextServiceDate: vehicle.nextServiceDate,
          insuranceExpiryDate: vehicle.insuranceExpiryDate
        });

        // Oil Change Alert: current mileage >= next oil change mileage
        if (vehicle.currentMileage && vehicle.nextOilChangeMileage && 
            vehicle.currentMileage >= vehicle.nextOilChangeMileage) {
          console.log('Oil change alert for vehicle:', vehicle.id);
          generatedAlerts.push({
            id: `oil_${vehicle.id}`,
            vehicle,
            type: 'OIL_CHANGE',
            message: 'Oil change required',
            dueMileage: vehicle.nextOilChangeMileage,
            currentMileage: vehicle.currentMileage
          });
        }

        // Service Alert: today >= next service date
        if (vehicle.nextServiceDate) {
          const serviceDate = new Date(vehicle.nextServiceDate);
          console.log('Service check:', serviceDate, 'vs', today, 'result:', today >= serviceDate);
          if (today >= serviceDate) {
            console.log('Service alert for vehicle:', vehicle.id);
            generatedAlerts.push({
              id: `service_${vehicle.id}`,
              vehicle,
              type: 'SERVICE',
              message: 'Service required',
              dueDate: vehicle.nextServiceDate
            });
          }
        }

        // Insurance Alert: today >= insurance expiry date
        if (vehicle.insuranceExpiryDate) {
          const insuranceDate = new Date(vehicle.insuranceExpiryDate);
          console.log('Insurance check:', insuranceDate, 'vs', today, 'result:', today >= insuranceDate);
          if (today >= insuranceDate) {
            console.log('Insurance alert for vehicle:', vehicle.id);
            generatedAlerts.push({
              id: `insurance_${vehicle.id}`,
              vehicle,
              type: 'INSURANCE',
              message: 'Insurance renewal required',
              dueDate: vehicle.insuranceExpiryDate
            });
          }
        }
      });

      console.log('Generated alerts:', generatedAlerts);
      setAlerts(generatedAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
      showToast('Failed to load maintenance alerts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const typeConfig = {
    INSURANCE: { icon: '🛡️', label: 'Insurance Renewal', color: 'text-blue-600' },
    OIL_CHANGE: { icon: '🛢️', label: 'Oil Change', color: 'text-orange-600' },
    SERVICE: { icon: '🔧', label: 'Service', color: 'text-purple-600' }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading maintenance alerts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Maintenance Alerts</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <AlertTriangle className="w-5 h-5" />
          <span>{alerts.length} Active Alert{alerts.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">All Clear!</h2>
          <p className="text-gray-600">No maintenance alerts at this time. All vehicles are up to date.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">VEHICLE</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">LICENSE PLATE</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">TYPE</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">DUE DATE</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">MILEAGE</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">STATUS</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">MESSAGE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {alerts.map(alert => {
                  const config = typeConfig[alert.type];
                  return (
                    <tr key={alert.id} className="hover:bg-gray-50 transition border-l-4 border-l-red-500">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Car className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-800">
                              {alert.vehicle.brand} {alert.vehicle.model}
                            </div>
                            <div className="text-xs text-gray-500">ID: #{alert.vehicle.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-xs font-semibold inline-block">
                          {alert.vehicle.licensePlate}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{config.icon}</span>
                          <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {alert.type === 'OIL_CHANGE' ? (
                          <div className="text-sm text-gray-500">Based on mileage</div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-800">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(alert.dueDate)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {alert.type === 'OIL_CHANGE' ? (
                          <div>
                            <div>Current: {alert.currentMileage?.toLocaleString()} km</div>
                            <div>Due at: {alert.dueMileage?.toLocaleString()} km</div>
                          </div>
                        ) : (
                          <div className="text-gray-500">N/A</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          OVERDUE
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {alert.message}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;