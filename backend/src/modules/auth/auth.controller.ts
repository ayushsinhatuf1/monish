import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response';
import { sendOtpSchema, verifyOtpSchema, refreshTokenSchema } from '../../shared/validators';

export const authController = {
  async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone } = sendOtpSchema.parse(req.body);
      const result = await authService.sendOtp(phone);
      sendSuccess(res, result, 'OTP sent successfully');
    } catch (error) {
      next(error);
    }
  },

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const data = verifyOtpSchema.parse(req.body);
      const result = await authService.verifyOtp(data.phone, data.otp, data.deviceId);
      sendSuccess(res, result, 'OTP verified successfully');
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);
      const result = await authService.refreshToken(refreshToken);
      sendSuccess(res, result, 'Token refreshed');
    } catch (error) {
      next(error);
    }
  },
};
