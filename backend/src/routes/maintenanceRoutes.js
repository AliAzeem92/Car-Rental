import express from 'express';
import { markComplete, updateMaintenance, updateSchedules, getAlerts, softDelete, restore } from '../controllers/maintenanceController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/alerts', authenticate, requireAdmin, getAlerts);
router.put('/:id/complete', authenticate, requireAdmin, markComplete);
router.put('/update', authenticate, requireAdmin, updateMaintenance);
router.put('/vehicle/:vehicleId/schedules', authenticate, requireAdmin, updateSchedules);
router.delete('/:id', authenticate, requireAdmin, softDelete);
router.put('/:id/restore', authenticate, requireAdmin, restore);

export default router;
