import express from 'express';
import { markComplete, updateMaintenance, updateSchedules, getAlerts } from '../controllers/maintenanceController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/alerts', authenticate, requireAdmin, getAlerts);
router.put('/:id/complete', authenticate, requireAdmin, markComplete);
router.put('/update', authenticate, requireAdmin, updateMaintenance);
router.put('/vehicle/:vehicleId/schedules', authenticate, requireAdmin, updateSchedules);

export default router;
