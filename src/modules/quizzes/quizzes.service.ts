import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';

export async function getQuizById(userId: string, quizId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      lesson: { include: { module: true } },
      questions: {
        orderBy: { order: 'asc' },
        include: {
          answers: { select: { id: true, text: true } },
        },
      },
    },
  });

  if (!quiz) throw new AppError('Quiz not found', 404);

  const isFreeModule = quiz.lesson.module.order === 1;

  if (!isFreeModule) {
    const activeSub = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE', endsAt: { gte: new Date() } },
    });

    if (!activeSub) {
      throw new AppError(
        'This quiz requires an active subscription. Upgrade to continue learning.',
        402
      );
    }
  }

  return quiz;
}

export async function submitQuizAttempt(
  userId: string,
  quizId: string,
  answers: Array<{ questionId: string; selectedAnswerId: string }>
) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      lesson: { include: { module: true } },
      questions: { include: { answers: true } },
    },
  });

  if (!quiz) throw new AppError('Quiz not found', 404);

  const isFreeModule = quiz.lesson.module.order === 1;
  if (!isFreeModule) {
    const activeSub = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE', endsAt: { gte: new Date() } },
    });
    if (!activeSub) {
      throw new AppError('This quiz requires an active subscription.', 402);
    }
  }

  // ...rest of scoring logic stays the same
}

export async function getUserQuizAttempts(userId: string, quizId: string) {
  return prisma.quizAttempt.findMany({
    where: { userId, quizId },
    orderBy: { attemptedAt: 'desc' },
  });
}