import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { walletService } from './wallet.service';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { addMoneySchema, withdrawSchema, verifyPaymentSchema, paginationSchema } from '../../shared/validators';

export const walletController = {
  async getBalance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const wallet = await walletService.getBalance(req.userId!);
      sendSuccess(res, wallet);
    } catch (error) {
      next(error);
    }
  },

  async getTransactions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit } = paginationSchema.parse(req.query);
      const result = await walletService.getTransactions(req.userId!, page, limit);
      sendPaginated(res, result.transactions, result.total, page, limit);
    } catch (error) {
      next(error);
    }
  },

  async addMoney(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { amount } = addMoneySchema.parse(req.body);
      const order = await walletService.createAddMoneyOrder(req.userId!, amount);
      sendSuccess(res, order, 'Payment order created');
    } catch (error) {
      next(error);
    }
  },

  async withdraw(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = withdrawSchema.parse(req.body);
      const result = await walletService.requestWithdrawal(req.userId!, data.amount, data.upiId);
      sendSuccess(res, result, 'Withdrawal request submitted');
    } catch (error) {
      next(error);
    }
  },

  async verifyPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = verifyPaymentSchema.parse(req.body);
      const result = await walletService.verifyAndCreditPayment(
        req.userId!,
        data.razorpayOrderId,
        data.razorpayPaymentId,
        data.razorpaySignature
      );
      sendSuccess(res, result, 'Payment verified and credited');
    } catch (error) {
      next(error);
    }
  },
};
