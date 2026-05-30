import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { quizService } from './quiz.service';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { quizFiltersSchema, submitAnswersSchema } from '../../shared/validators';

export const quizController = {
  async listQuizzes(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = quizFiltersSchema.parse(req.query);
      const result = await quizService.listQuizzes(filters);
      sendPaginated(res, result.quizzes, result.total, filters.page, filters.limit);
    } catch (error) {
      next(error);
    }
  },

  async getQuizDetail(req: Request, res: Response, next: NextFunction) {
    try {
      // Optional auth logic to see if current user has joined
      const userId = (req as AuthRequest).userId;
      const quiz = await quizService.getQuizDetail(req.params.id, userId);
      sendSuccess(res, quiz);
    } catch (error) {
      next(error);
    }
  },

  async joinQuiz(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await quizService.joinQuiz(req.params.id, req.userId!);
      sendSuccess(res, result, 'Successfully joined quiz');
    } catch (error) {
      next(error);
    }
  },

  async getQuestions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const questions = await quizService.getQuestionsForPlay(req.params.id, req.userId!);
      sendSuccess(res, questions);
    } catch (error) {
      next(error);
    }
  },

  async submitAnswers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { answers } = submitAnswersSchema.parse(req.body);
      const result = await quizService.submitAnswers(req.params.id, req.userId!, answers);
      sendSuccess(res, result, 'Quiz submitted successfully');
    } catch (error) {
      next(error);
    }
  },

  async getResult(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await quizService.getResult(req.params.id, req.userId!);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  async getQuizWinners(req: Request, res: Response, next: NextFunction) {
    try {
      const winners = await quizService.getQuizWinners(req.params.id);
      sendSuccess(res, winners);
    } catch (error) {
      next(error);
    }
  },
};
