import express from 'express';
import { login, logout, checkAuth, register, forgotPassword, resetPassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/check', authenticate, checkAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
