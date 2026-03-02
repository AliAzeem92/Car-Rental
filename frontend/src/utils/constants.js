export const RESERVATION_STATUS = {
  PENDING: { value: 'PENDING', label: 'Pending', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-100' },
  CONFIRMED: { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-100' },
  ONGOING: { value: 'ONGOING', label: 'Ongoing', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-100' },
  COMPLETED: { value: 'COMPLETED', label: 'Completed', color: 'bg-gray-400', textColor: 'text-gray-700', bgLight: 'bg-gray-100' },
  CANCELLED: { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-100' }
};

export const PAYMENT_STATUS = {
  PAID: { value: 'PAID', label: 'Paid', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-100' },
  UNPAID: { value: 'UNPAID', label: 'Unpaid', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-100' },
  PARTIAL: { value: 'PARTIAL', label: 'Partial', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-100' }
};

export const VEHICLE_STATUS = {
  AVAILABLE: { value: 'AVAILABLE', label: 'Available', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-100' },
  RESERVED: { value: 'RESERVED', label: 'Reserved', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-100' },
  RENTED: { value: 'RENTED', label: 'Rented', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-100' },
  MAINTENANCE: { value: 'MAINTENANCE', label: 'Maintenance', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-100' }
};
