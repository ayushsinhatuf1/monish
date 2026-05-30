import { Router } from 'express';
import { walletController } from './wallet.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// GET /api/wallet/balance
router.get('/balance', walletController.getBalance);

// GET /api/wallet/transactions
router.get('/transactions', walletController.getTransactions);

// POST /api/wallet/add-money
router.post('/add-money', walletController.addMoney);

// POST /api/wallet/withdraw
router.post('/withdraw', walletController.withdraw);

// POST /api/wallet/verify-payment (Razorpay callback)
router.post('/verify-payment', walletController.verifyPayment);

export { router as walletRoutes };
