import { Request, Response, NextFunction } from 'express';
import { courseQuerySchema, setUserLanguageSchema } from './languages.validators';
import * as languagesService from './languages.service';

export async function getLanguages(_req: Request, res: Response, next: NextFunction) {
  try {
    const languages = await languagesService.getAllLanguages();
    res.json(languages);
  } catch (err) {
    next(err);
  }
}

export async function getLanguagePairs(_req: Request, res: Response, next: NextFunction) {
  try {
    const pairs = await languagesService.getAllLanguagePairs();
    res.json(pairs);
  } catch (err) {
    next(err);
  }
}

export async function setMyLanguagePair(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.userId;
    const { languagePairId } = setUserLanguageSchema.parse(req.body);
    const result = await languagesService.setUserLanguagePair(userId, languagePairId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getCourses(req: Request, res: Response, next: NextFunction) {
  try {
    const { languagePairId } = courseQuerySchema.parse(req.query);
    const courses = await languagesService.getCourses(languagePairId);
    res.json(courses);
  } catch (err) {
    next(err);
  }
}

export async function getCourseModules(req: Request, res: Response, next: NextFunction) {
  try {
    const modules = await languagesService.getCourseModules(req.params.courseId as string);
    res.json(modules);
  } catch (err) {
    next(err);
  }
}

export async function getLesson(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.userId;
    const lesson = await languagesService.getLessonById(userId, req.params.lessonId as string);
    res.json(lesson);
  } catch (err) {
    next(err);
  }
}