import express from 'express';
import { customerRegister, customerLogin, customerLogout, getCustomerProfile } from '../controllers/customerAuthController.js';
import { authenticateCustomer } from '../middleware/customerAuth.js';

const router = express.Router();

router.post('/register', customerRegister);
router.post('/login', customerLogin);
router.post('/logout', customerLogout);
router.get('/profile', authenticateCustomer, getCustomerProfile);

export default router;
