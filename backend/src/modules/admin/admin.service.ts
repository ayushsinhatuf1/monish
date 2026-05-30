import { prisma } from '../../config/database';
import { walletService } from '../wallet/wallet.service';
import { createAppError } from '../../middlewares/error.middleware';
import { CreateQuizInput } from '../../shared/validators';
import { weightedLuckyDraw, calculateRevenue } from '../../utils/helpers';

export const adminService = {
  async createQuiz(data: CreateQuizInput, adminId: string) {
    return prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.create({
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          entryFee: data.entryFee,
          minParticipants: data.minParticipants,
          maxParticipants: data.maxParticipants,
          prizePoolPercentage: data.prizePoolPercentage,
          startTime: new Date(data.startTime),
          durationSeconds: data.durationSeconds,
          createdBy: adminId,
          status: 'upcoming',
        },
      });

      await tx.prizeStructure.createMany({
        data: data.prizeStructure.map((p) => ({
          quizId: quiz.id,
          rankLabel: p.rankLabel,
          prizeType: p.prizeType,
          prizeValue: p.prizeValue,
          prizeDescription: p.prizeDescription,
          winnerCount: p.winnerCount,
        })),
      });

      await tx.question.createMany({
        data: data.questions.map((q) => ({
          quizId: quiz.id,
          questionText: q.questionText,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctOption: q.correctOption,
          timeLimitSeconds: q.timeLimitSeconds,
          orderIndex: q.orderIndex,
        })),
      });

      return quiz;
    });
  },

  async cancelQuiz(quizId: string) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { participants: true },
    });

    if (!quiz) throw createAppError('Quiz not found', 404);
    if (quiz.status === 'completed' || quiz.status === 'cancelled') {
      throw createAppError('Cannot cancel this quiz', 400);
    }

    await prisma.quiz.update({
      where: { id: quizId },
      data: { status: 'cancelled' },
    });

    // Refund all paid participants
    for (const participant of quiz.participants) {
      if (participant.paymentStatus === 'paid') {
        await walletService.creditWallet(
          participant.userId,
          Number(quiz.entryFee),
          `Refund: Quiz Cancelled - ${quiz.title}`,
          quiz.id
        );
        await prisma.quizParticipant.update({
          where: { id: participant.id },
          data: { paymentStatus: 'refunded', isRefunded: true },
        });
      }
    }

    // TODO: Trigger socket event 'quiz:cancelled'
    return { cancelled: true, refundedCount: quiz.participants.length };
  },

  async announceWinners(quizId: string) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        prizeStructure: { orderBy: { prizeValue: 'desc' } },
        attempts: { where: { isEligible: true, completedAt: { not: null } } },
      },
    });

    if (!quiz) throw createAppError('Quiz not found', 404);
    if (quiz.status !== 'active' && quiz.status !== 'completed') {
      throw createAppError('Quiz must be active or completed to announce winners', 400);
    }

    const { prizeStructure, attempts, entryFee, currentParticipants, prizePoolPercentage } = quiz;

    // Calculate actual revenue and prize pool based on current participants
    const revenue = calculateRevenue(Number(entryFee), currentParticipants, Number(prizePoolPercentage));

    // Get eligible participants
    const eligibleParticipants = attempts.map(a => ({
      userId: a.userId,
      timeTakenSeconds: a.timeTakenSeconds,
    }));

    // Perform weighted lucky draw
    const totalWinnersNeeded = prizeStructure.reduce((sum, p) => sum + p.winnerCount, 0);
    const drawResults = weightedLuckyDraw(eligibleParticipants, totalWinnersNeeded);

    // Assign prizes
    const winnersToCreate: any[] = [];
    let drawIndex = 0;

    for (const structure of prizeStructure) {
      for (let i = 0; i < structure.winnerCount; i++) {
        if (drawIndex >= drawResults.length) break;

        const winnerId = drawResults[drawIndex].userId;

        winnersToCreate.push({
          quizId,
          userId: winnerId,
          rankLabel: structure.rankLabel,
          prizeType: structure.prizeType,
          prizeValue: structure.prizeValue,
          isPaid: false, // Set to true after processing payout
        });

        drawIndex++;
      }
    }

    // Process payouts and save winners
    await prisma.$transaction(async (tx) => {
      for (const w of winnersToCreate) {
        const createdWinner = await tx.winner.create({ data: w });

        if (w.prizeType === 'cash' || w.prizeType === 'wallet_credit') {
          // Add to wallet balance
          await tx.wallet.update({
            where: { userId: w.userId },
            data: { balance: { increment: w.prizeValue }, totalAdded: { increment: w.prizeValue } },
          });

          await tx.user.update({
            where: { id: w.userId },
            data: { walletBalance: { increment: w.prizeValue }, totalWinnings: { increment: w.prizeValue } },
          });

          await tx.walletTransaction.create({
            data: {
              userId: w.userId,
              type: 'credit',
              amount: w.prizeValue,
              description: `Winnings: ${w.rankLabel} prize for Quiz ${quiz.title}`,
              referenceId: createdWinner.id,
              status: 'completed',
            },
          });

          await tx.winner.update({
            where: { id: createdWinner.id },
            data: { isPaid: true },
          });
        }
      }

      await tx.quiz.update({
        where: { id: quizId },
        data: { status: 'completed' },
      });
    });

    // TODO: Trigger socket event 'quiz:winner_announced'
    return {
      announced: true,
      winnersCount: winnersToCreate.length,
      revenueStats: revenue,
    };
  },

  async getRevenue() {
    const quizzes = await prisma.quiz.findMany({
      where: { status: 'completed' },
      select: { entryFee: true, currentParticipants: true, prizePoolPercentage: true },
    });

    let totalCollection = 0;
    let totalPrizePool = 0;
    let totalPlatformRevenue = 0;

    quizzes.forEach((q) => {
      const rev = calculateRevenue(Number(q.entryFee), q.currentParticipants, Number(q.prizePoolPercentage));
      totalCollection += rev.totalCollection;
      totalPrizePool += rev.prizePool;
      totalPlatformRevenue += rev.platformRevenue;
    });

    return { totalCollection, totalPrizePool, totalPlatformRevenue };
  },

  async getUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        walletBalance: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit for MVP
    });
  },

  async blockUser(userId: string, isBlocked: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { isActive: !isBlocked },
      select: { id: true, isActive: true },
    });
  },

  async getWithdrawals() {
    return prisma.walletTransaction.findMany({
      where: { type: 'debit', status: 'pending', description: { startsWith: 'Withdrawal' } },
      include: {
        user: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  },

  async approveWithdrawal(transactionId: string, approved: boolean, remarks?: string) {
    const tx = await prisma.walletTransaction.findUnique({ where: { id: transactionId } });
    if (!tx || tx.status !== 'pending') throw createAppError('Invalid transaction', 400);

    if (approved) {
      // Mark as completed. (In real life, this is where you call Razorpay Payouts API)
      await prisma.walletTransaction.update({
        where: { id: transactionId },
        data: { status: 'completed', description: remarks ? `${tx.description} - ${remarks}` : tx.description },
      });
    } else {
      // Reject and refund the user's wallet
      await walletService.creditWallet(tx.userId, Number(tx.amount), `Refund: Withdrawal rejected. ${remarks || ''}`);
      await prisma.walletTransaction.update({
        where: { id: transactionId },
        data: { status: 'failed', description: remarks ? `${tx.description} - Rejected: ${remarks}` : `${tx.description} - Rejected` },
      });
    }
    return { success: true };
  },
};
