import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';

export async function createLanguage(data: {
  name: string;
  code: string;
  description?: string;
}) {
  const existing = await prisma.language.findUnique({ where: { code: data.code } });
  if (existing) throw new AppError('Language code already exists', 409);

  return prisma.language.create({ data });
}

export async function createCourse(data: {
  languagePairId: string;
  title: string;
  level: string;
  order: number;
}) {
  const pair = await prisma.languagePair.findUnique({ where: { id: data.languagePairId } });
  if (!pair) throw new AppError('Language pair not found', 404);

  return prisma.course.create({ data });
}

export async function createModule(data: {
  courseId: string;
  title: string;
  order: number;
}) {
  const course = await prisma.course.findUnique({ where: { id: data.courseId } });
  if (!course) throw new AppError('Course not found', 404);

  return prisma.module.create({ data });
}

export async function createLesson(data: {
  moduleId: string;
  title: string;
  content: string;
  order: number;
  estimatedMinutes: number;
}) {
  const module = await prisma.module.findUnique({ where: { id: data.moduleId } });
  if (!module) throw new AppError('Module not found', 404);

  return prisma.lesson.create({ data });
}

export async function createQuiz(data: {
  lessonId: string;
  title: string;
  passThreshold: number;
  questions: Array<{
    type: 'MULTIPLE_CHOICE' | 'MATCHING' | 'FILL_BLANK';
    prompt: string;
    order: number;
    answers: Array<{ text: string; isCorrect: boolean }>;
  }>;
}) {
  const lesson = await prisma.lesson.findUnique({ where: { id: data.lessonId } });
  if (!lesson) throw new AppError('Lesson not found', 404);

  return prisma.quiz.create({
    data: {
      lessonId: data.lessonId,
      title: data.title,
      passThreshold: data.passThreshold,
      questions: {
        create: data.questions.map((q) => ({
          type: q.type,
          prompt: q.prompt,
          order: q.order,
          answers: { create: q.answers },
        })),
      },
    },
    include: { questions: { include: { answers: true } } },
  });
}

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      subscriptions: {
        select: { status: true, plan: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAnalytics() {
  const [userCount, activeSubscriptions, totalLessonsCompleted, totalQuizAttempts] =
    await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.lessonProgress.count({ where: { status: 'COMPLETED' } }),
      prisma.quizAttempt.count(),
    ]);

  return { userCount, activeSubscriptions, totalLessonsCompleted, totalQuizAttempts };
}