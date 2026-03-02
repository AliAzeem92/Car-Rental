import express from 'express';
import { getCustomers, updateCustomer, toggleBlacklist, uploadProfileImage } from '../controllers/customerController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', authenticate, requireAdmin, getCustomers);
router.put('/:id', authenticate, updateCustomer);
router.put('/:id/blacklist', authenticate, requireAdmin, toggleBlacklist);
router.post('/:id/upload-image', authenticate, upload.single('image'), uploadProfileImage);

export default router;
