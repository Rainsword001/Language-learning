import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isYesterday(a: Date, b: Date) {
  const yesterday = new Date(b);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(a, yesterday);
}

export async function completeLesson(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) throw new AppError('Lesson not found', 404);

  const progress = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { status: 'COMPLETED', completedAt: new Date() },
    create: {
      userId,
      lessonId,
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  await updateStreak(userId);

  return progress;
}

async function updateStreak(userId: string) {
  const now = new Date();

  const streak = await prisma.streak.findUnique({ where: { userId } });

  if (!streak) {
    return prisma.streak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: now,
      },
    });
  }

  if (streak.lastActiveDate && isSameDay(streak.lastActiveDate, now)) {
    // Already logged activity today — no change needed
    return streak;
  }

  const continuesStreak =
    streak.lastActiveDate && isYesterday(streak.lastActiveDate, now);

  const newCurrentStreak = continuesStreak ? streak.currentStreak + 1 : 1;
  const newLongestStreak = Math.max(newCurrentStreak, streak.longestStreak);

  return prisma.streak.update({
    where: { userId },
    data: {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastActiveDate: now,
    },
  });
}

export async function getUserProgress(userId: string) {
  const [lessonProgress, streak, totalLessonsCompleted] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId },
      include: { lesson: { select: { title: true } } },
      orderBy: { completedAt: 'desc' },
    }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.lessonProgress.count({
      where: { userId, status: 'COMPLETED' },
    }),
  ]);

  return {
    lessonProgress,
    streak: streak ?? { currentStreak: 0, longestStreak: 0 },
    totalLessonsCompleted,
  };
}