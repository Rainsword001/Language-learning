import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';

export async function getAllLanguages() {
  return prisma.language.findMany({ orderBy: { name: 'asc' } });
}

export async function getAllLanguagePairs() {
  return prisma.languagePair.findMany({
    include: {
      knownLanguage: true,
      targetLanguage: true,
    },
  });
}

export async function setUserLanguagePair(userId: string, languagePairId: string) {
  const pair = await prisma.languagePair.findUnique({ where: { id: languagePairId } });
  if (!pair) throw new AppError('Language pair not found', 404);

  return prisma.userLanguage.upsert({
    where: {
      userId_languagePairId: { userId, languagePairId },
    },
    update: {},
    create: { userId, languagePairId },
  });
}

export async function getCourses(languagePairId?: string) {
  return prisma.course.findMany({
    where: languagePairId ? { languagePairId } : undefined,
    orderBy: { order: 'asc' },
    include: {
      languagePair: {
        include: { knownLanguage: true, targetLanguage: true },
      },
    },
  });
}

export async function getCourseModules(courseId: string) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new AppError('Course not found', 404);

  return prisma.module.findMany({
    where: { courseId },
    orderBy: { order: 'asc' },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
          order: true,
          estimatedMinutes: true,
        },
      },
    },
  });
}

export async function getLessonById(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: true,
      vocabulary: true,
      quizzes: {
        select: { id: true, title: true, passThreshold: true },
      },
    },
  });

  if (!lesson) throw new AppError('Lesson not found', 404);

  const isFreeModule = lesson.module.order === 1;

  if (!isFreeModule) {
    const activeSub = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endsAt: { gte: new Date() },
      },
    });

    if (!activeSub) {
      throw new AppError(
        'This lesson requires an active subscription. Upgrade to continue learning.',
        402
      );
    }
  }

  return lesson;
}