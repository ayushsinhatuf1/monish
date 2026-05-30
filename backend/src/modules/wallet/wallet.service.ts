import crypto from 'crypto';
import { prisma } from '../../config/database';
import { razorpay } from '../../config/razorpay';
import { env } from '../../config/env';
import { createAppError } from '../../middlewares/error.middleware';

export const walletService = {
  async getBalance(userId: string) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      // Create wallet if it doesn't exist
      const newWallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          totalAdded: 0,
          totalWithdrawn: 0,
          totalSpent: 0,
        },
      });
      return {
        balance: 0,
        totalAdded: 0,
        totalWithdrawn: 0,
        totalSpent: 0,
      };
    }

    return {
      balance: Number(wallet.balance),
      totalAdded: Number(wallet.totalAdded),
      totalWithdrawn: Number(wallet.totalWithdrawn),
      totalSpent: Number(wallet.totalSpent),
    };
  },

  async getTransactions(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.walletTransaction.count({ where: { userId } }),
    ]);

    return {
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        description: t.description,
        referenceId: t.referenceId,
        status: t.status,
        createdAt: t.createdAt,
      })),
      total,
    };
  },

  /**
   * Create a Razorpay order for adding money to wallet
   */
  async createAddMoneyOrder(userId: string, amount: number) {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay uses paise
      currency: 'INR',
      receipt: `wallet_${userId}_${Date.now()}`,
      notes: {
        userId,
        type: 'wallet_topup',
      },
    });

    // Create pending transaction
    await prisma.walletTransaction.create({
      data: {
        userId,
        type: 'credit',
        amount,
        description: 'Wallet top-up',
        referenceId: order.id,
        status: 'pending',
      },
    });

    return {
      orderId: order.id,
      amount: amount,
      currency: 'INR',
      keyId: env.RAZORPAY_KEY_ID,
    };
  },

  /**
   * Verify Razorpay payment and credit wallet
   */
  async verifyAndCreditPayment(
    userId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) {
    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      throw createAppError('Payment verification failed', 400);
    }

    // Find the pending transaction
    const transaction = await prisma.walletTransaction.findFirst({
      where: {
        userId,
        referenceId: razorpayOrderId,
        status: 'pending',
      },
    });

    if (!transaction) {
      throw createAppError('Transaction not found', 404);
    }

    const amount = Number(transaction.amount);

    // Credit wallet in a transaction
    await prisma.$transaction([
      // Update wallet balance
      prisma.wallet.update({
        where: { userId },
        data: {
          balance: { increment: amount },
          totalAdded: { increment: amount },
        },
      }),
      // Update user wallet balance
      prisma.user.update({
        where: { id: userId },
        data: { walletBalance: { increment: amount } },
      }),
      // Mark transaction as completed
      prisma.walletTransaction.update({
        where: { id: transaction.id },
        data: { status: 'completed' },
      }),
    ]);

    return { balance: amount, credited: amount };
  },

  /**
   * Request a withdrawal
   */
  async requestWithdrawal(userId: string, amount: number, upiId: string) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet || Number(wallet.balance) < amount) {
      throw createAppError('Insufficient wallet balance', 400);
    }

    // Debit wallet and create pending withdrawal
    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId },
        data: {
          balance: { decrement: amount },
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: amount } },
      }),
      prisma.walletTransaction.create({
        data: {
          userId,
          type: 'debit',
          amount,
          description: `Withdrawal to UPI: ${upiId}`,
          status: 'pending',
        },
      }),
    ]);

    return {
      message: 'Withdrawal request submitted. It will be processed within 24 hours.',
      amount,
      upiId,
    };
  },

  /**
   * Credit wallet (internal use - for refunds, winnings, referral bonuses)
   */
  async creditWallet(userId: string, amount: number, description: string, referenceId?: string) {
    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId },
        data: {
          balance: { increment: amount },
          totalAdded: { increment: amount },
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { walletBalance: { increment: amount } },
      }),
      prisma.walletTransaction.create({
        data: {
          userId,
          type: 'credit',
          amount,
          description,
          referenceId,
          status: 'completed',
        },
      }),
    ]);
  },

  /**
   * Debit wallet (internal use - for quiz entry fees)
   */
  async debitWallet(userId: string, amount: number, description: string, referenceId?: string) {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || Number(wallet.balance) < amount) {
      throw createAppError('Insufficient wallet balance', 400);
    }

    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId },
        data: {
          balance: { decrement: amount },
          totalSpent: { increment: amount },
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: amount } },
      }),
      prisma.walletTransaction.create({
        data: {
          userId,
          type: 'debit',
          amount,
          description,
          referenceId,
          status: 'completed',
        },
      }),
    ]);
  },
};
