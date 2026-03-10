import express from 'express';
import { getVehicles, getVehicle, createVehicle, updateVehicle, getVehicleHistory } from '../controllers/vehicleController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/', getVehicles);
router.get('/:id', getVehicle);

// Admin protected routes
router.post('/', authenticate, requireAdmin, upload.array('images', 5), createVehicle);
router.put('/:id', authenticate, requireAdmin, upload.array('images', 5), updateVehicle);
router.get('/:id/history', authenticate, requireAdmin, getVehicleHistory);

export default router;
