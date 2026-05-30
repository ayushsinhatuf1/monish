import { Router } from 'express';
import { userController } from './user.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

// GET /api/users/me
router.get('/me', userController.getProfile);

// PUT /api/users/me
router.put('/me', userController.updateProfile);

// GET /api/users/me/stats
router.get('/me/stats', userController.getStats);

// GET /api/users/me/referrals
router.get('/me/referrals', userController.getReferrals);

export { router as userRoutes };
