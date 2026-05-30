import { prisma } from '../../config/database';
import { createAppError } from '../../middlewares/error.middleware';
import { generateReferralCode } from '../../utils/helpers';

interface UpdateProfileData {
  name?: string;
  email?: string;
  avatar?: string;
  referralCode?: string;
}

export const userService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
      },
    });

    if (!user) throw createAppError('User not found', 404);

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      avatar: user.avatar,
      walletBalance: Number(user.wallet?.balance || 0),
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      totalWinnings: Number(user.totalWinnings),
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  },

  async updateProfile(userId: string, data: UpdateProfileData) {
    // Handle referral code application
    if (data.referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: data.referralCode },
      });

      if (!referrer) throw createAppError('Invalid referral code', 400);
      if (referrer.id === userId) throw createAppError('Cannot use your own referral code', 400);

      // Check if already referred
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.referredBy) throw createAppError('Referral code already applied', 400);

      // Apply referral
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { referredBy: data.referralCode },
        }),
        prisma.referral.create({
          data: {
            referrerId: referrer.id,
            referredId: userId,
            rewardAmount: 25, // ₹25 bonus
            status: 'pending',
          },
        }),
      ]);

      // Remove referralCode from update data
      delete data.referralCode;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        avatar: data.avatar,
      },
      include: { wallet: true },
    });

    return {
      id: updated.id,
      name: updated.name,
      phone: updated.phone,
      email: updated.email,
      avatar: updated.avatar,
      walletBalance: Number(updated.wallet?.balance || 0),
      referralCode: updated.referralCode,
      totalWinnings: Number(updated.totalWinnings),
    };
  },

  async getStats(userId: string) {
    const [quizzesPlayed, quizzesWon, user] = await Promise.all([
      prisma.quizAttempt.count({ where: { userId } }),
      prisma.winner.count({ where: { userId } }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { totalWinnings: true },
      }),
    ]);

    return {
      quizzesPlayed,
      quizzesWon,
      totalWinnings: Number(user?.totalWinnings || 0),
      winRate: quizzesPlayed > 0 ? Math.round((quizzesWon / quizzesPlayed) * 100) : 0,
    };
  },

  async getReferrals(userId: string) {
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: { id: true, name: true, avatar: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalEarnings = referrals
      .filter((r) => r.status === 'credited')
      .reduce((sum, r) => sum + Number(r.rewardAmount), 0);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });

    return {
      referralCode: user?.referralCode,
      totalReferrals: referrals.length,
      totalEarnings,
      referrals: referrals.map((r) => ({
        id: r.id,
        referred: r.referred,
        rewardAmount: Number(r.rewardAmount),
        status: r.status,
        createdAt: r.createdAt,
      })),
    };
  },
};
