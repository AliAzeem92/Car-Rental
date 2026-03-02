import express from 'express';
import { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle, getVehicleHistory } from '../controllers/vehicleController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', authenticate, getVehicles);
router.get('/:id', authenticate, getVehicle);
router.post('/', authenticate, requireAdmin, upload.array('images', 5), createVehicle);
router.put('/:id', authenticate, requireAdmin, upload.array('images', 5), updateVehicle);
router.delete('/:id', authenticate, requireAdmin, deleteVehicle);
router.get('/:id/history', authenticate, requireAdmin, getVehicleHistory);

export default router;
