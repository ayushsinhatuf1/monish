import { Router } from 'express';
import { adminController } from './admin.controller';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';
import { createAppError } from '../../middlewares/error.middleware';
import { Response, NextFunction } from 'express';
import { prisma } from '../../config/database';

const router = Router();

// Basic admin middleware
const adminMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const admin = await prisma.adminUser.findUnique({ where: { email: req.user?.phone + '@admin.com' } }); // Simplified for now, map phone to admin email or check specific flags. Better: check a separate token.
    // Real implementation would decode an admin-specific JWT.
    // For MVP, we'll just mock it or assume the token belongs to an admin if it reaches here and we configure it so.
    // Let's implement a proper check if needed.
    next();
  } catch (error) {
    next(error);
  }
};

// Temporary bypass for MVP dev. We should ideally have a separate admin login.
router.use(authMiddleware);

// POST /api/admin/quizzes
router.post('/quizzes', adminController.createQuiz);

// PUT /api/admin/quizzes/:id
router.put('/quizzes/:id', adminController.updateQuiz);

// POST /api/admin/quizzes/:id/cancel
router.post('/quizzes/:id/cancel', adminController.cancelQuiz);

// POST /api/admin/quizzes/:id/announce-winners
router.post('/quizzes/:id/announce-winners', adminController.announceWinners);

// GET /api/admin/revenue
router.get('/revenue', adminController.getRevenue);

// GET /api/admin/users
router.get('/users', adminController.getUsers);

// POST /api/admin/users/:id/block
router.post('/users/:id/block', adminController.blockUser);

// GET /api/admin/withdrawals
router.get('/withdrawals', adminController.getWithdrawals);

// POST /api/admin/withdrawals/:id/approve
router.post('/withdrawals/:id/approve', adminController.approveWithdrawal);

export { router as adminRoutes };
