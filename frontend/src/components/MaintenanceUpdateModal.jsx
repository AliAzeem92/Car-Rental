import { useState } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const MaintenanceUpdateModal = ({ isOpen, onClose, alert, onUpdate }) => {
  const [formData, setFormData] = useState({
    nextOilChangeMileage: '',
    nextServiceDate: '',
    insuranceExpiryDate: ''
  });
  const [loading, setLoading] = useState(false);

  // Initialize form data when modal opens
  useState(() => {
    if (isOpen && alert) {
      setFormData({
        nextOilChangeMileage: alert.vehicle?.nextOilChangeMileage || '',
        nextServiceDate: alert.vehicle?.nextServiceDate ? 
          new Date(alert.vehicle.nextServiceDate).toISOString().split('T')[0] : '',
        insuranceExpiryDate: alert.vehicle?.insuranceExpiryDate ? 
          new Date(alert.vehicle.insuranceExpiryDate).toISOString().split('T')[0] : ''
      });
    }
  }, [isOpen, alert]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(formData);
      onClose();
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !alert) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Update Maintenance Schedule</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">
            Vehicle: {alert.vehicle?.brand} {alert.vehicle?.model}
          </p>
          <p className="text-sm text-gray-600">
            License: {alert.vehicle?.licensePlate}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Next Oil Change (km)
            </label>
            <input
              type="number"
              value={formData.nextOilChangeMileage}
              onChange={(e) => setFormData({ ...formData, nextOilChangeMileage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter mileage for next oil change"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Next Service Date
            </label>
            <input
              type="date"
              value={formData.nextServiceDate}
              onChange={(e) => setFormData({ ...formData, nextServiceDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Insurance Expiry Date
            </label>
            <input
              type="date"
              value={formData.insuranceExpiryDate}
              onChange={(e) => setFormData({ ...formData, insuranceExpiryDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
            >
              Update Schedule
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceUpdateModal;