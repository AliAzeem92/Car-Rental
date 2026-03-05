import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  createCheckOut,
  createCheckIn,
  getCheckInOut,
  updateCheckIn
} from '../controllers/checkInOutController.js';

const router = express.Router();

router.use(authenticate);
router.use(requireAdmin);

router.post('/reservations/:reservationId/checkout', createCheckOut);
router.post('/reservations/:reservationId/checkin', createCheckIn);
router.get('/reservations/:reservationId/checkinout', getCheckInOut);
router.put('/checkin/:checkinId', updateCheckIn);

export default router;