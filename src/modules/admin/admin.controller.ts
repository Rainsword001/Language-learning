import { Request, Response, NextFunction } from 'express';
import {
  createLanguageSchema,
  createCourseSchema,
  createModuleSchema,
  createLessonSchema,
  createQuizSchema,
} from './admin.validators';
import * as adminService from './admin.service';

export async function createLanguage(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createLanguageSchema.parse(req.body);
    const language = await adminService.createLanguage(data);
    res.status(201).json(language);
  } catch (err) {
    next(err);
  }
}

export async function createCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createCourseSchema.parse(req.body);
    const course = await adminService.createCourse(data);
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
}

export async function createModule(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createModuleSchema.parse(req.body);
    const module = await adminService.createModule(data);
    res.status(201).json(module);
  } catch (err) {
    next(err);
  }
}

export async function createLesson(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createLessonSchema.parse(req.body);
    const lesson = await adminService.createLesson(data);
    res.status(201).json(lesson);
  } catch (err) {
    next(err);
  }
}

export async function createQuiz(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createQuizSchema.parse(req.body);
    const quiz = await adminService.createQuiz(data);
    res.status(201).json(quiz);
  } catch (err) {
    next(err);
  }
}

export async function getAllUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await adminService.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function getAnalytics(_req: Request, res: Response, next: NextFunction) {
  try {
    const analytics = await adminService.getAnalytics();
    res.json(analytics);
  } catch (err) {
    next(err);
  }
}