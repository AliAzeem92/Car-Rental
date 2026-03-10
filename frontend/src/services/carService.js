import api from './api';

export const carService = {
  // Fetch all cars
  fetchCars: async (params = {}) => {
    try {
      const response = await api.get('/vehicles', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch cars');
    }
  },

  // Fetch single car by ID
  fetchCarById: async (id) => {
    try {
      const response = await api.get(`/vehicles/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch car details');
    }
  },

  // Fetch available cars for date range
  fetchAvailableCars: async (pickupDate, returnDate) => {
    try {
      const response = await api.get('/vehicles/available', {
        params: { pickup: pickupDate, return: returnDate }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch available cars');
    }
  }
};

export default carService;