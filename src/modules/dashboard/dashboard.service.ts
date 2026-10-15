import { prisma } from '../../config/prisma';

export async function getDashboard(userId: string) {
  const [userLanguage, streak, completedLessonIds] = await Promise.all([
    prisma.userLanguage.findFirst({
      where: { userId },
      include: {
        languagePair: {
          include: { knownLanguage: true, targetLanguage: true },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.lessonProgress.findMany({
      where: { userId, status: 'COMPLETED' },
      select: { lessonId: true },
    }),
  ]);

  if (!userLanguage) {
    return {
      onboarded: false,
      message: 'Select a language pair to get started.',
    };
  }

  const completedIds = new Set(completedLessonIds.map((p) => p.lessonId));

  const courses = await prisma.course.findMany({
    where: { languagePairId: userLanguage.languagePairId },
    orderBy: { order: 'asc' },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            select: { id: true, title: true, order: true },
          },
        },
      },
    },
  });

  const allLessons = courses.flatMap((c) =>
    c.modules.flatMap((m) =>
      m.lessons.map((l) => ({ ...l, courseTitle: c.title, moduleTitle: m.title }))
    )
  );

  const totalLessons = allLessons.length;
  const completedCount = allLessons.filter((l) => completedIds.has(l.id)).length;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const nextLesson = allLessons.find((l) => !completedIds.has(l.id)) ?? null;

  const recentActivity = await prisma.lessonProgress.findMany({
    where: { userId, status: 'COMPLETED' },
    orderBy: { completedAt: 'desc' },
    take: 5,
    include: { lesson: { select: { title: true } } },
  });

  return {
    onboarded: true,
    languagePair: {
      known: userLanguage.languagePair.knownLanguage.name,
      target: userLanguage.languagePair.targetLanguage.name,
    },
    progress: {
      completedLessons: completedCount,
      totalLessons,
      progressPercent,
    },
    streak: streak
      ? { currentStreak: streak.currentStreak, longestStreak: streak.longestStreak }
      : { currentStreak: 0, longestStreak: 0 },
    recommendedNextLesson: nextLesson,
    recentActivity,
  };
}