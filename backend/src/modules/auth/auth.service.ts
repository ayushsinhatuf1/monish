import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { redisHelpers } from '../../config/redis';
import { env } from '../../config/env';
import { generateOtp, generateReferralCode } from '../../utils/helpers';
import { createAppError } from '../../middlewares/error.middleware';

export const authService = {
  /**
   * Send OTP to phone number
   * In development, returns OTP directly for testing
   */
  async sendOtp(phone: string) {
    // Rate limiting: max 5 OTPs per phone per hour
    const rateLimitKey = `otp_rate:${phone}`;
    const attempts = await redisHelpers.get(rateLimitKey);
    if (attempts && parseInt(attempts) >= 5) {
      throw createAppError('Too many OTP requests. Try again later.', 429);
    }

    const otp = generateOtp();
    await redisHelpers.storeOtp(phone, otp);

    // Track rate limiting
    if (attempts) {
      await redisHelpers.increment(rateLimitKey);
    } else {
      await redisHelpers.setWithExpiry(rateLimitKey, '1', 3600);
    }

    // In production, send OTP via Firebase/MSG91
    // For development, return OTP in response
    if (env.NODE_ENV === 'development') {
      return { message: 'OTP sent', otp }; // Remove in production!
    }

    // TODO: Integrate Firebase Auth or MSG91 for production OTP
    return { message: 'OTP sent to your phone' };
  },

  /**
   * Verify OTP and return JWT tokens
   * Creates user account if it doesn't exist
   */
  async verifyOtp(phone: string, otp: string, deviceId?: string) {
    const storedOtp = await redisHelpers.getOtp(phone);

    if (!storedOtp) {
      throw createAppError('OTP expired. Request a new one.', 400);
    }

    if (storedOtp !== otp) {
      throw createAppError('Invalid OTP', 400);
    }

    // OTP valid, delete it
    await redisHelpers.deleteOtp(phone);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const referralCode = generateReferralCode();

      user = await prisma.user.create({
        data: {
          phone,
          referralCode,
          deviceId,
          wallet: {
            create: {
              balance: 0,
              totalAdded: 0,
              totalWithdrawn: 0,
              totalSpent: 0,
            },
          },
        },
      });
    } else {
      // Update device ID
      if (deviceId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { deviceId },
        });
      }
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user.id },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      env.JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        avatar: user.avatar,
        walletBalance: Number(user.walletBalance),
        referralCode: user.referralCode,
        totalWinnings: Number(user.totalWinnings),
        isActive: user.isActive,
      },
      tokens: { accessToken, refreshToken },
      isNewUser,
    };
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        userId: string;
        type: string;
      };

      if (decoded.type !== 'refresh') {
        throw createAppError('Invalid token type', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !user.isActive) {
        throw createAppError('User not found or blocked', 401);
      }

      const accessToken = jwt.sign(
        { userId: user.id },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const newRefreshToken = jwt.sign(
        { userId: user.id, type: 'refresh' },
        env.JWT_REFRESH_SECRET,
        { expiresIn: '30d' }
      );

      return {
        tokens: { accessToken, refreshToken: newRefreshToken },
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw createAppError('Refresh token expired. Please login again.', 401);
      }
      throw error;
    }
  },
};
