import api from './api';

export const bookingService = {
  // Create new booking
  createBooking: async (bookingData) => {
    try {
      console.log('Sending booking request:', bookingData); // Debug log
      const response = await api.post('/reservations', bookingData);
      return response.data;
    } catch (error) {
      console.error('Booking service error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to create booking');
    }
  },

  // Get customer bookings
  getCustomerBookings: async () => {
    try {
      const response = await api.get('/reservations/customer');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }
};

export default bookingService;