import express from 'express';
import { getReservations, createReservation, updateReservationStatus, updatePaymentStatus, checkIn, checkOut, downloadContract } from '../controllers/reservationController.js';
import { getAvailableStatusTransitions } from '../controllers/statusController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/', authenticate, getReservations);
router.post('/', bookingLimiter, authenticate, createReservation);
router.get('/:id/available-transitions', authenticate, getAvailableStatusTransitions);
router.put('/:id/status', authenticate, requireAdmin, updateReservationStatus);
router.put('/:id/payment-status', authenticate, requireAdmin, updatePaymentStatus);
router.post('/:id/checkin', authenticate, requireAdmin, upload.single('signature'), checkIn);
router.post('/:id/checkout', authenticate, requireAdmin, upload.single('signature'), checkOut);
router.get('/:id/contract.pdf', downloadContract);

export default router;
