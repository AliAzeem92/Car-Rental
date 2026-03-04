import express from 'express';
import { markComplete, updateMaintenance } from '../controllers/maintenanceController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.put('/:id/complete', authenticate, requireAdmin, markComplete);
router.put('/update', authenticate, requireAdmin, updateMaintenance);

export default router;
