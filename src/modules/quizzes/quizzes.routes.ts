import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as quizzesController from './quizzes.controller';

const router = Router();

router.get('/quizzes/:quizId', authenticate, quizzesController.getQuiz);
router.post('/quizzes/:quizId/attempts', authenticate, quizzesController.submitQuiz);
router.get('/quizzes/:quizId/attempts', authenticate, quizzesController.getMyAttempts);

export default router;