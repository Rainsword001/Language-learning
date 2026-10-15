import { Request, Response, NextFunction } from 'express';
import { submitQuizSchema } from './quizzes.validators';
import * as quizzesService from './quizzes.service';

export async function getQuiz(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.userId;
    const quiz = await quizzesService.getQuizById(userId, req.params.quizId as string);
    res.json(quiz);
  } catch (err) {
    next(err);
  }
}

export async function submitQuiz(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.userId;
    const { answers } = submitQuizSchema.parse(req.body);
    const result = await quizzesService.submitQuizAttempt(
      userId,
      req.params.quizId as string,
      answers
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getMyAttempts(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.userId;
    const attempts = await quizzesService.getUserQuizAttempts(
      userId,
      req.params.quizId as string
    );
    res.json(attempts);
  } catch (err) {
    next(err);
  }
}