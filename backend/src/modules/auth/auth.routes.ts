import { Router } from 'express';
import { authController } from './auth.controller';

const router = Router();

// POST /api/auth/send-otp
router.post('/send-otp', authController.sendOtp);

// POST /api/auth/verify-otp
router.post('/verify-otp', authController.verifyOtp);

// POST /api/auth/refresh-token
router.post('/refresh-token', authController.refreshToken);

export { router as authRoutes };
