import express from 'express';
import { generateInvoice, getInvoiceSettings, updateInvoiceSettings } from '../controllers/invoiceController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/reservations/:reservationId/invoice', authenticate, generateInvoice);
router.get('/settings', authenticate, requireAdmin, getInvoiceSettings);
router.put('/settings', authenticate, requireAdmin, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'adminSignature', maxCount: 1 }
]), updateInvoiceSettings);

export default router;
