import { useState, useEffect } from 'react';
import api from '../services/api';

const STATUS_LABELS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

const PAYMENT_LABELS = {
  UNPAID: 'Unpaid',
  PARTIAL: 'Partial',
  PAID: 'Paid'
};

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  ONGOING: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
};

const PAYMENT_COLORS = {
  UNPAID: 'bg-red-100 text-red-800',
  PARTIAL: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800'
};

export const ReservationStatusDropdown = ({ reservationId, currentStatus, onUpdate }) => {
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAvailableStatuses();
  }, [reservationId, currentStatus]);

  const loadAvailableStatuses = async () => {
    try {
      const { data } = await api.get(`/reservations/${reservationId}/available-transitions`);
      setAvailableStatuses(data.availableReservationStatuses);
    } catch (error) {
      console.error('Failed to load available statuses:', error);
    }
  };

  const handleChange = async (newStatus) => {
    if (newStatus === currentStatus) return;
    
    setLoading(true);
    try {
      await onUpdate(newStatus);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const isTerminal = availableStatuses.length === 0;

  return (
    <div className="relative">
      <select
        value={currentStatus}
        onChange={(e) => handleChange(e.target.value)}
        disabled={loading || isTerminal}
        className={`px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_COLORS[currentStatus]} ${
          isTerminal ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
        }`}
      >
        <option value={currentStatus}>{STATUS_LABELS[currentStatus]}</option>
        {availableStatuses.map(status => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
      {isTerminal && (
        <span className="ml-2 text-xs text-gray-500">(Final)</span>
      )}
    </div>
  );
};

export const PaymentStatusDropdown = ({ reservationId, currentStatus, onUpdate }) => {
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAvailableStatuses();
  }, [reservationId, currentStatus]);

  const loadAvailableStatuses = async () => {
    try {
      const { data } = await api.get(`/reservations/${reservationId}/available-transitions`);
      setAvailableStatuses(data.availablePaymentStatuses);
    } catch (error) {
      console.error('Failed to load available payment statuses:', error);
    }
  };

  const handleChange = async (newStatus) => {
    if (newStatus === currentStatus) return;
    
    setLoading(true);
    try {
      await onUpdate(newStatus);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update payment status');
    } finally {
      setLoading(false);
    }
  };

  const isTerminal = availableStatuses.length === 0;

  return (
    <div className="relative">
      <select
        value={currentStatus}
        onChange={(e) => handleChange(e.target.value)}
        disabled={loading || isTerminal}
        className={`px-3 py-1.5 rounded-full text-sm font-medium ${PAYMENT_COLORS[currentStatus]} ${
          isTerminal ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
        }`}
      >
        <option value={currentStatus}>{PAYMENT_LABELS[currentStatus]}</option>
        {availableStatuses.map(status => (
          <option key={status} value={status}>
            {PAYMENT_LABELS[status]}
          </option>
        ))}
      </select>
      {isTerminal && (
        <span className="ml-2 text-xs text-gray-500">(Final)</span>
      )}
    </div>
  );
};
