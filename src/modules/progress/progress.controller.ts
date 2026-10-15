import { Request, Response, NextFunction } from 'express';
import { completeLessonSchema } from './progress.validators';
import * as progressService from './progress.service';

export async function completeLesson(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.userId;
    const { lessonId } = completeLessonSchema.parse(req.body);
    const result = await progressService.completeLesson(userId, lessonId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getMyProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.userId;
    const progress = await progressService.getUserProgress(userId);
    res.json(progress);
  } catch (err) {
    next(err);
  }
}