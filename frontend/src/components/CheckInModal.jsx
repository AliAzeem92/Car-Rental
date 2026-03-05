import { useState } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const CheckInModal = ({ isOpen, onClose, reservation, onCheckIn }) => {
  const [formData, setFormData] = useState({
    mileageIn: '',
    damageReport: '',
    extraCharges: '0'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.mileageIn) return;

    setLoading(true);
    try {
      await onCheckIn(formData);
      onClose();
      setFormData({ mileageIn: '', damageReport: '', extraCharges: '0' });
    } catch (error) {
      console.error('Check-in failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Check In Vehicle</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">Vehicle: {reservation?.vehicle?.brand} {reservation?.vehicle?.model}</p>
          <p className="text-sm text-gray-600">Check-out Mileage: {reservation?.checkout?.mileageOut?.toLocaleString()}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Return Mileage *
            </label>
            <input
              type="number"
              value={formData.mileageIn}
              onChange={(e) => setFormData({ ...formData, mileageIn: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter current mileage"
              min={reservation?.checkout?.mileageOut || 0}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Damage Report
            </label>
            <textarea
              value={formData.damageReport}
              onChange={(e) => setFormData({ ...formData, damageReport: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Any damage or issues found..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Extra Charges
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.extraCharges}
              onChange={(e) => setFormData({ ...formData, extraCharges: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              min="0"
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
              Complete Check-in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckInModal;