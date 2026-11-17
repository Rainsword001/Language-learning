import argon2 from 'argon2';
import crypto from 'crypto';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { sendPasswordResetEmail } from '../../utils/email';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt';

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Email already in use', 409);

  const passwordHash = await argon2.hash(password);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  return issueTokens(user.id, user.role);
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('Invalid credentials', 401);

  const valid = await argon2.verify(user.passwordHash, password);
  if (!valid) throw new AppError('Invalid credentials', 401);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return issueTokens(user.id, user.role);
}

export async function refreshTokens(refreshToken: string) {
  let payload: { userId: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.refreshTokenHash) {
    throw new AppError('Invalid refresh token', 401);
  }

  const matches = await argon2.verify(user.refreshTokenHash, refreshToken);
  if (!matches) throw new AppError('Invalid refresh token', 401);

  return issueTokens(user.id, user.role);
}

export async function logoutUser(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshTokenHash: null },
  });
}

async function issueTokens(userId: string, role: 'USER' | 'ADMIN') {
  const accessToken = signAccessToken({ userId, role });
  const refreshToken = signRefreshToken(userId);

  const refreshTokenHash = await argon2.hash(refreshToken);
  await prisma.user.update({
    where: { id: userId },
    data: { refreshTokenHash },
  });

  return { accessToken, refreshToken };
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // don't leak whether the email exists

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetTokenHash, resetTokenExpiry },
  });

  await sendPasswordResetEmail(email, resetToken);
}

export async function resetPassword(token: string, newPassword: string) {
  const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      resetTokenHash,
      resetTokenExpiry: { gte: new Date() },
    },
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  const passwordHash = await argon2.hash(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetTokenHash: null,
      resetTokenExpiry: null,
      refreshTokenHash: null, // force re-login on all devices after reset
    },
  });
}