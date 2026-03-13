import express from 'express';
import { getAvailableVehicles, createCustomerReservation, getMyReservations, cancelReservation } from '../controllers/customerPortalController.js';
import { authenticateCustomer } from '../middleware/customerAuth.js';

const router = express.Router();

router.get('/vehicles', getAvailableVehicles);
router.post('/reservations', authenticateCustomer, createCustomerReservation);
router.get('/reservations', authenticateCustomer, getMyReservations);
router.put('/reservations/:id/cancel', authenticateCustomer, cancelReservation);

export default router;
