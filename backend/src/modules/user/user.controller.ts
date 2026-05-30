import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { userService } from './user.service';
import { sendSuccess } from '../../utils/response';
import { updateProfileSchema } from '../../shared/validators';

export const userController = {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.getProfile(req.userId!);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateProfileSchema.parse(req.body);
      const user = await userService.updateProfile(req.userId!, data);
      sendSuccess(res, user, 'Profile updated');
    } catch (error) {
      next(error);
    }
  },

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await userService.getStats(req.userId!);
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  },

  async getReferrals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const referrals = await userService.getReferrals(req.userId!);
      sendSuccess(res, referrals);
    } catch (error) {
      next(error);
    }
  },
};
