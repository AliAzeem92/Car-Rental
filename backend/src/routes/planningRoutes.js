import express from 'express';
import { getCalendar, getMaintenanceAlerts } from '../controllers/planningController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/calendar', authenticate, getCalendar);
router.get('/maintenance', authenticate, getMaintenanceAlerts);

export default router;
