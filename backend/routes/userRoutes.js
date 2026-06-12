import express from 'express';
import {
  authAdmin,
  authUser,
  forgotPassword,
  getProfile,
  getSessions,
  registerUser,
  requestOtp,
  resetPassword,
  revokeSession,
  socialLogin,
  verifyEmail,
  verifyOtp,
  syncUserData,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(registerUser);
router.post('/login', authUser);
router.post('/admin-login', authAdmin);
router.get('/profile', protect, getProfile);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/otp/request', requestOtp);
router.post('/otp/verify', verifyOtp);
router.get('/sessions', protect, getSessions);
router.delete('/sessions/:id', protect, revokeSession);
router.post('/social/:provider', socialLogin);
router.put('/sync', protect, syncUserData);

export default router;
