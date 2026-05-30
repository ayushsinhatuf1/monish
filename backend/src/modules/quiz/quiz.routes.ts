import { Router } from 'express';
import { quizController } from './quiz.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', quizController.listQuizzes);
router.get('/:id', quizController.getQuizDetail);
router.get('/:id/winners', quizController.getQuizWinners);

// Protected routes
router.post('/:id/join', authMiddleware, quizController.joinQuiz);
router.get('/:id/questions', authMiddleware, quizController.getQuestions);
router.post('/:id/submit', authMiddleware, quizController.submitAnswers);
router.get('/:id/result', authMiddleware, quizController.getResult);

export { router as quizRoutes };
