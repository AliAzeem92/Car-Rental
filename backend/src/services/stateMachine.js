// State Machine Configuration
export const RESERVATION_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['ONGOING', 'CANCELLED'],
  ONGOING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: []
};

export const PAYMENT_TRANSITIONS = {
  UNPAID: ['PARTIAL', 'PAID'],
  PARTIAL: ['PAID'],
  PAID: []
};

// Validation Functions
export const canTransitionReservation = (currentStatus, newStatus) => {
  if (currentStatus === newStatus) return true;
  return RESERVATION_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
};

export const canTransitionPayment = (currentStatus, newStatus) => {
  if (currentStatus === newStatus) return true;
  return PAYMENT_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
};

export const getAvailableReservationTransitions = (currentStatus) => {
  return RESERVATION_TRANSITIONS[currentStatus] || [];
};

export const getAvailablePaymentTransitions = (currentStatus) => {
  return PAYMENT_TRANSITIONS[currentStatus] || [];
};

export const isTerminalReservationStatus = (status) => {
  return ['COMPLETED', 'CANCELLED'].includes(status);
};

export const isTerminalPaymentStatus = (status) => {
  return status === 'PAID';
};
