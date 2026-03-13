import { useState } from 'react';
import Modal from './Modal';
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Check In Vehicle"
      size="max-w-md"
    >
      {/* Vehicle info */}
      <div className="mb-5 p-3 bg-blue-50 border border-blue-100 rounded-xl">
        <p className="text-sm font-medium text-blue-800">
          {reservation?.vehicle?.brand} {reservation?.vehicle?.model}
        </p>
        {reservation?.checkout?.mileageOut && (
          <p className="text-xs text-blue-600 mt-0.5">
            Check-out Mileage: {reservation.checkout.mileageOut.toLocaleString()} km
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Return Mileage <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.mileageIn}
            onChange={(e) => setFormData({ ...formData, mileageIn: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Enter current mileage"
            min={reservation?.checkout?.mileageOut || 0}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Damage Report
          </label>
          <textarea
            value={formData.damageReport}
            onChange={(e) => setFormData({ ...formData, damageReport: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            rows="3"
            placeholder="Any damage or issues found..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Extra Charges (€)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.extraCharges}
            onChange={(e) => setFormData({ ...formData, extraCharges: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="0.00"
            min="0"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
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
    </Modal>
  );
};

export default CheckInModal;