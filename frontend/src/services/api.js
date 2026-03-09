import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  checkAuth: () => api.get('/auth/check')
};

export const vehicleAPI = {
  getAll: (params) => api.get('/vehicles', { params }),
  getAvailable: (pickupDate, returnDate) => api.get('/vehicles/available', { 
    params: { pickup: pickupDate, return: returnDate } 
  }),
  getOne: (id) => api.get(`/vehicles/${id}`),
  create: (formData) => api.post('/vehicles', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/vehicles/${id}`, data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}),
  getHistory: (id) => api.get(`/vehicles/${id}/history`)
};

export const customerAPI = {
  getAll: () => api.get('/customers'),
  create: (formData) => api.post('/customers', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/customers/${id}`, data),
  toggleBlacklist: (id) => api.put(`/customers/${id}/blacklist`)
};

export const reservationAPI = {
  getAll: (params) => api.get('/reservations', { params }),
  getCustomerReservations: () => api.get('/reservations/customer'),
  create: (data) => api.post('/reservations', data),
  updateStatus: (id, status) => api.put(`/reservations/${id}/status`, { status }),
  updatePaymentStatus: (id, paymentStatus) => api.put(`/reservations/${id}/payment-status`, { paymentStatus }),
  checkIn: (id, formData) => api.post(`/reservations/${id}/checkin`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  checkOut: (id, formData) => api.post(`/reservations/${id}/checkout`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
};

export const checkInOutAPI = {
  createCheckOut: (reservationId) => api.post(`/checkinout/reservations/${reservationId}/checkout`),
  createCheckIn: (reservationId, data) => api.post(`/checkinout/reservations/${reservationId}/checkin`, data),
  getCheckInOut: (reservationId) => api.get(`/checkinout/reservations/${reservationId}/checkinout`),
  updateCheckIn: (checkinId, data) => api.put(`/checkinout/checkin/${checkinId}`, data)
};

export const planningAPI = {
  getCalendar: (params) => api.get('/planning/calendar', { params }),
  getMaintenanceAlerts: () => api.get('/planning/maintenance')
};

export const maintenanceAPI = {
  markComplete: (id) => api.put(`/maintenance/${id}/complete`),
  update: (data) => api.put('/maintenance/update', data),
  getAlerts: () => api.get('/maintenance/alerts'),
  updateSchedules: (vehicleId, data) => api.put(`/maintenance/vehicle/${vehicleId}/schedules`, data),
  softDelete: (id) => api.delete(`/maintenance/${id}`),
  restore: (id) => api.put(`/maintenance/${id}/restore`)
};

export default api;
