import { useState, useEffect } from 'react';
import { AlertTriangle, Calendar, Car, CheckCircle2 } from 'lucide-react';
import { planningAPI, maintenanceAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import Button from '../components/Button';

const Maintenance = () => {
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isAnimating, setIsAnimating] = useState(false);
  const [updateModal, setUpdateModal] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const { data } = await planningAPI.getMaintenanceAlerts();
      setAlerts(data);
    } catch (error) {
      showToast('Failed to load maintenance alerts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilDue = (dueDate, dueMileage, currentMileage) => {
    if (dueMileage && currentMileage) {
      const kmLeft = dueMileage - currentMileage;
      if (kmLeft <= 0) return -999;
      return Math.ceil(kmLeft / 50);
    }
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getAlertColor = (daysUntil) => {
    if (daysUntil < 0) return { bg: 'bg-red-50', border: 'border-l-red-500', text: 'text-red-800', badge: 'bg-red-100 text-red-700' };
    if (daysUntil <= 7) return { bg: 'bg-orange-50', border: 'border-l-orange-500', text: 'text-orange-800', badge: 'bg-orange-100 text-orange-700' };
    return { bg: 'bg-yellow-50', border: 'border-l-yellow-500', text: 'text-yellow-800', badge: 'bg-yellow-100 text-yellow-700' };
  };

  const typeConfig = {
    INSURANCE: { icon: '🛡️', label: 'Insurance Renewal', color: 'text-blue-600' },
    OIL_CHANGE: { icon: '🛢️', label: 'Oil Change', color: 'text-orange-600' },
    SERVICE: { icon: '🔧', label: 'Service', color: 'text-purple-600' }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handlePageChange = (newPage) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPage(newPage);
      setIsAnimating(false);
    }, 150);
  };

  const handleMarkComplete = async () => {
    if (!updateModal) return;
    setUpdating(true);
    try {
      const { data } = await maintenanceAPI.markComplete(updateModal.id);
      showToast(data.message || 'Maintenance marked as complete', 'success');
      setUpdateModal(null);
      loadAlerts();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update maintenance';
      showToast(message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const totalPages = Math.ceil(alerts.length / itemsPerPage);
  const paginatedAlerts = alerts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
            <span className="text-4xl">✅</span>
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">ACTIONS</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-100 transition-opacity duration-150 ${
                isAnimating ? 'opacity-0' : 'opacity-100'
              }`}>
                {paginatedAlerts.map(alert => {
                  const daysUntil = getDaysUntilDue(alert.dueDate, alert.dueMileage, alert.vehicle.mileage);
                  const colors = getAlertColor(daysUntil);
                  const config = typeConfig[alert.type];

                  return (
                    <tr key={alert.id} className={`hover:bg-gray-50 transition border-l-4 ${colors.border}`}>
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
                        <div className="flex items-center gap-2 text-sm text-gray-800">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(alert.dueDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {alert.dueMileage ? `${alert.dueMileage.toLocaleString()} km` : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
                          {daysUntil < 0 ? (
                            alert.dueMileage ? 'OVERDUE' : `OVERDUE ${Math.abs(daysUntil)}d`
                          ) : daysUntil === 0 ? (
                            'DUE TODAY'
                          ) : (
                            alert.dueMileage ? `${alert.dueMileage - alert.vehicle.mileage} km left` : `${daysUntil} days left`
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setUpdateModal(alert)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Complete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {alerts.length > itemsPerPage && (
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, alerts.length)} of {alerts.length}</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 border rounded hover:bg-gray-50 ${
                  currentPage === i + 1 ? 'bg-blue-500 text-white' : ''
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button 
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <Modal isOpen={!!updateModal} onClose={() => setUpdateModal(null)} title="Mark Maintenance Complete">
        {updateModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Car className="w-8 h-8 text-gray-600" />
                <div>
                  <div className="font-semibold text-gray-800">
                    {updateModal.vehicle.brand} {updateModal.vehicle.model}
                  </div>
                  <div className="text-sm text-gray-600">{updateModal.vehicle.licensePlate}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-2xl">{typeConfig[updateModal.type].icon}</span>
                <span className="font-medium">{typeConfig[updateModal.type].label}</span>
              </div>
            </div>
            <p className="text-gray-600">Are you sure you want to mark this maintenance as complete? This will remove it from the alerts list.</p>
            <div className="flex gap-3">
              <Button onClick={handleMarkComplete} loading={updating} className="flex-1">
                Mark Complete
              </Button>
              <Button onClick={() => setUpdateModal(null)} variant="secondary" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Maintenance;
