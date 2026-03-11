import express from 'express';
import { login, logout, checkAuth, register, forgotPassword, resetPassword, changePassword, updateProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/check', authenticate, checkAuth);
router.put('/profile', authenticate, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', authenticate, changePassword);

export default router;
