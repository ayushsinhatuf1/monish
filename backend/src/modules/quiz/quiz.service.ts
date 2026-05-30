import { prisma } from '../../config/database';
import { redisHelpers } from '../../config/redis';
import { walletService } from '../wallet/wallet.service';
import { createAppError } from '../../middlewares/error.middleware';
import { QuizFiltersInput } from '../../shared/validators';
import { OptionLetter } from '../../shared/types';

export const quizService = {
  async listQuizzes(filters: QuizFiltersInput) {
    const { category, status, minFee, maxFee, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (minFee !== undefined) where.entryFee = { gte: minFee };
    if (maxFee !== undefined) where.entryFee = { ...where.entryFee, lte: maxFee };

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where,
        select: {
          id: true,
          title: true,
          category: true,
          entryFee: true,
          prizePoolPercentage: true,
          minParticipants: true,
          maxParticipants: true,
          currentParticipants: true,
          status: true,
          startTime: true,
        },
        orderBy: { startTime: 'asc' },
        skip,
        take: limit,
      }),
      prisma.quiz.count({ where }),
    ]);

    // Enhance with real-time counts from Redis if available
    const enhancedQuizzes = await Promise.all(
      quizzes.map(async (q) => {
        const liveCount = await redisHelpers.getQuizParticipantCount(q.id);
        return {
          ...q,
          entryFee: Number(q.entryFee),
          prizePoolPercentage: Number(q.prizePoolPercentage),
          currentParticipants: liveCount !== null ? liveCount : q.currentParticipants,
        };
      })
    );

    return { quizzes: enhancedQuizzes, total };
  },

  async getQuizDetail(quizId: string, userId?: string) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        prizeStructure: true,
      },
    });

    if (!quiz) throw createAppError('Quiz not found', 404);

    let hasJoined = false;
    if (userId) {
      const participant = await prisma.quizParticipant.findUnique({
        where: { quizId_userId: { quizId, userId } },
      });
      hasJoined = !!participant;
    }

    const liveCount = await redisHelpers.getQuizParticipantCount(quizId);

    return {
      ...quiz,
      entryFee: Number(quiz.entryFee),
      prizePoolPercentage: Number(quiz.prizePoolPercentage),
      currentParticipants: liveCount !== null ? liveCount : quiz.currentParticipants,
      prizeStructure: quiz.prizeStructure.map((p) => ({
        ...p,
        prizeValue: Number(p.prizeValue),
      })),
      hasJoined,
    };
  },

  async joinQuiz(quizId: string, userId: string) {
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) throw createAppError('Quiz not found', 404);

    if (quiz.status !== 'upcoming' && quiz.status !== 'filling') {
      throw createAppError('Quiz is not open for joining', 400);
    }

    const liveCount = (await redisHelpers.getQuizParticipantCount(quizId)) ?? quiz.currentParticipants;
    if (liveCount >= quiz.maxParticipants) {
      throw createAppError('Quiz is already full', 400);
    }

    const existingParticipant = await prisma.quizParticipant.findUnique({
      where: { quizId_userId: { quizId, userId } },
    });
    if (existingParticipant) {
      throw createAppError('You have already joined this quiz', 400);
    }

    // Process payment (debit wallet)
    const entryFee = Number(quiz.entryFee);
    if (entryFee > 0) {
      await walletService.debitWallet(userId, entryFee, `Entry fee for quiz: ${quiz.title}`);
    }

    // Add participant
    await prisma.$transaction([
      prisma.quizParticipant.create({
        data: {
          quizId,
          userId,
          paymentStatus: 'paid',
        },
      }),
      prisma.quiz.update({
        where: { id: quizId },
        data: { currentParticipants: { increment: 1 } },
      }),
    ]);

    // Update real-time counter in Redis
    const newCount = await redisHelpers.incrementQuizParticipantCount(quizId);

    // Auto-update status based on participant count
    const updatedCount = quiz.currentParticipants + 1;
    if (updatedCount >= quiz.maxParticipants) {
      // Full — mark as active (ready to play)
      await prisma.quiz.update({
        where: { id: quizId },
        data: { status: 'active' },
      });
    } else if (updatedCount >= quiz.minParticipants && quiz.status === 'upcoming') {
      await prisma.quiz.update({
        where: { id: quizId },
        data: { status: 'filling' },
      });
    }

    return { joined: true, newParticipantCount: newCount };
  },

  async getQuestionsForPlay(quizId: string, userId: string) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { orderBy: { orderIndex: 'asc' } } },
    });

    if (!quiz) throw createAppError('Quiz not found', 404);
    // Allow play for active, filling, or upcoming (for demo/testing)
    if (quiz.status === 'completed' || quiz.status === 'cancelled') {
      throw createAppError('This quiz has ended', 400);
    }

    const participant = await prisma.quizParticipant.findUnique({
      where: { quizId_userId: { quizId, userId } },
    });
    if (!participant) throw createAppError('You must join the quiz to play', 403);

    // Record start attempt if it doesn't exist
    let attempt = await prisma.quizAttempt.findUnique({
      where: { quizId_userId: { quizId, userId } },
    });

    if (!attempt) {
      attempt = await prisma.quizAttempt.create({
        data: { quizId, userId },
      });
    } else if (attempt.completedAt) {
      throw createAppError('You have already completed this quiz', 400);
    }

    // Strip correctOption before sending to client
    const safeQuestions = quiz.questions.map((q) => {
      const { correctOption, ...safe } = q;
      return safe;
    });

    return {
      attemptId: attempt.id,
      questions: safeQuestions,
      durationSeconds: quiz.durationSeconds,
      endTime: quiz.endTime, // Added back to Quiz model in schema
    };
  },

  async submitAnswers(quizId: string, userId: string, answers: { questionId: string; selectedOption: OptionLetter }[]) {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { quizId_userId: { quizId, userId } },
    });

    if (!attempt) throw createAppError('Attempt not found', 404);
    if (attempt.completedAt) throw createAppError('Already submitted', 400);

    const questions = await prisma.question.findMany({
      where: { quizId },
    });

    if (answers.length !== questions.length) {
      throw createAppError('Incomplete submission', 400);
    }

    let totalCorrect = 0;
    let totalWrong = 0;

    const answerRecords = answers.map((ans) => {
      const question = questions.find((q) => q.id === ans.questionId);
      if (!question) throw createAppError(`Question ${ans.questionId} not found`, 400);

      const isCorrect = question.correctOption === ans.selectedOption;
      if (isCorrect) totalCorrect++;
      else totalWrong++;

      return {
        attemptId: attempt.id,
        questionId: question.id,
        selectedOption: ans.selectedOption,
        isCorrect,
      };
    });

    const isEligible = totalCorrect === questions.length;
    const completedAt = new Date();
    const timeTakenSeconds = Math.round((completedAt.getTime() - attempt.startedAt.getTime()) / 1000);

    await prisma.$transaction([
      prisma.answer.createMany({ data: answerRecords }),
      prisma.quizAttempt.update({
        where: { id: attempt.id },
        data: {
          completedAt,
          totalCorrect,
          totalWrong,
          timeTakenSeconds,
          isEligible,
        },
      }),
    ]);

    return {
      attemptId: attempt.id,
      totalCorrect,
      totalWrong,
      timeTakenSeconds,
      isEligible,
    };
  },

  async getResult(quizId: string, userId: string) {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { quizId_userId: { quizId, userId } },
    });

    if (!attempt) throw createAppError('Result not found', 404);
    if (!attempt.completedAt) throw createAppError('Quiz not yet completed', 400);

    const questionsCount = await prisma.question.count({ where: { quizId } });

    return {
      attemptId: attempt.id,
      totalCorrect: attempt.totalCorrect,
      totalWrong: attempt.totalWrong,
      totalQuestions: questionsCount,
      timeTakenSeconds: attempt.timeTakenSeconds,
      isEligible: attempt.isEligible,
    };
  },

  async getQuizWinners(quizId: string) {
    const winners = await prisma.winner.findMany({
      where: { quizId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: [
        { prizeValue: 'desc' },
        { rankLabel: 'asc' }
      ],
    });

    return winners.map(w => ({
      ...w,
      prizeValue: Number(w.prizeValue)
    }));
  },
};
