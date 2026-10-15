import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

export async function requireActiveSubscription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = (req as any).user?.userId;

  const activeSub = await prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE', endsAt: { gte: new Date() } },
  });

  if (!activeSub) {
    return res.status(402).json({
      error: 'An active subscription is required to access this content.',
    });
  }

  next();
}