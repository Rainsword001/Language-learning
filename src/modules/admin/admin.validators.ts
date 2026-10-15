import { z } from 'zod';

export const createLanguageSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(5),
  description: z.string().optional(),
});

export const createCourseSchema = z.object({
  languagePairId: z.string().uuid(),
  title: z.string().min(2),
  level: z.string().min(2),
  order: z.number().int().positive(),
});

export const createModuleSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().min(2),
  order: z.number().int().positive(),
});

export const createLessonSchema = z.object({
  moduleId: z.string().uuid(),
  title: z.string().min(2),
  content: z.string().min(1),
  order: z.number().int().positive(),
  estimatedMinutes: z.number().int().positive().default(10),
});

export const createQuizSchema = z.object({
  lessonId: z.string().uuid(),
  title: z.string().min(2),
  passThreshold: z.number().int().min(0).max(100).default(70),
  questions: z.array(
    z.object({
      type: z.enum(['MULTIPLE_CHOICE', 'MATCHING', 'FILL_BLANK']),
      prompt: z.string().min(2),
      order: z.number().int().positive(),
      answers: z.array(
        z.object({
          text: z.string().min(1),
          isCorrect: z.boolean(),
        })
      ).min(2),
    })
  ).min(1),
});