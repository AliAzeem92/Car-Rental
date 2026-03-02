import express from 'express';
import { getCustomers, updateCustomer, toggleBlacklist } from '../controllers/customerController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, requireAdmin, getCustomers);
router.put('/:id', authenticate, requireAdmin, updateCustomer);
router.put('/:id/blacklist', authenticate, requireAdmin, toggleBlacklist);

export default router;
