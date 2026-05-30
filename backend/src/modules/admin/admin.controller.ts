import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service';
import { sendSuccess } from '../../utils/response';
import { createQuizSchema, blockUserSchema, approveWithdrawalSchema } from '../../shared/validators';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const adminController = {
  async createQuiz(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createQuizSchema.parse(req.body);
      const result = await adminService.createQuiz(data, req.userId!);
      sendSuccess(res, result, 'Quiz created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async updateQuiz(req: Request, res: Response, next: NextFunction) {
    // Left simple for MVP
    sendSuccess(res, { message: 'Not implemented in MVP' });
  },

  async cancelQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.cancelQuiz(req.params.id);
      sendSuccess(res, result, 'Quiz cancelled and refunds initiated');
    } catch (error) {
      next(error);
    }
  },

  async announceWinners(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.announceWinners(req.params.id);
      sendSuccess(res, result, 'Winners announced successfully');
    } catch (error) {
      next(error);
    }
  },

  async getRevenue(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.getRevenue();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.getUsers();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  async blockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const data = blockUserSchema.parse(req.body);
      const result = await adminService.blockUser(req.params.id, data.isBlocked);
      sendSuccess(res, result, `User ${data.isBlocked ? 'blocked' : 'unblocked'}`);
    } catch (error) {
      next(error);
    }
  },

  async getWithdrawals(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.getWithdrawals();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  async approveWithdrawal(req: Request, res: Response, next: NextFunction) {
    try {
      const data = approveWithdrawalSchema.parse(req.body);
      const result = await adminService.approveWithdrawal(req.params.id, data.approved, data.remarks);
      sendSuccess(res, result, `Withdrawal ${data.approved ? 'approved' : 'rejected'}`);
    } catch (error) {
      next(error);
    }
  },
};
