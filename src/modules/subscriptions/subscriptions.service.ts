import crypto from 'crypto';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { env } from '../../config/env';
import { initializeTransaction, verifyTransaction } from '../../utils/paystack';

export async function getAllPlans() {
  return prisma.plan.findMany({ orderBy: { price: 'asc' } });
}

export async function initiateCheckout(userId: string, planId: string) {
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) throw new AppError('Plan not found', 404);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  const reference = `sub_${crypto.randomBytes(12).toString('hex')}`;

  // Create a PENDING subscription up front, tied to this reference
  const subscription = await prisma.subscription.create({
    data: {
      userId,
      planId,
      status: 'PENDING',
      provider: 'paystack',
      providerReference: reference,
    },
  });

  const amountInKobo = Number(plan.price) * 100;

  const paystackData = await initializeTransaction({
    email: user.email,
    amountInKobo,
    reference,
    callbackUrl: `${env.CLIENT_URL}/subscription/callback`,
  });

  await prisma.paymentTransaction.create({
    data: {
      subscriptionId: subscription.id,
      amount: plan.price,
      status: 'initiated',
      rawPayload: paystackData,
    },
  });

  return {
    authorizationUrl: paystackData.authorization_url,
    reference,
  };
}

export async function handlePaystackWebhook(payload: any, signature: string) {
  // Verify the webhook actually came from Paystack
  const expectedSignature = crypto
    .createHmac('sha512', env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(payload))
    .digest('hex');

  if (expectedSignature !== signature) {
    throw new AppError('Invalid webhook signature', 401);
  }

  const event = payload.event;
  const reference = payload.data?.reference;

  if (!reference) return;

  const subscription = await prisma.subscription.findFirst({
    where: { providerReference: reference },
    include: { plan: true },
  });

  if (!subscription) return;

  // Idempotency check — don't double-process the same event
  const alreadyProcessed = await prisma.paymentTransaction.findFirst({
    where: { subscriptionId: subscription.id, status: 'success' },
  });
  if (alreadyProcessed) return;

  if (event === 'charge.success') {
    // Re-verify directly with Paystack rather than trusting the webhook payload alone
    const verified = await verifyTransaction(reference);

    if (verified.status !== 'success') return;

    const startsAt = new Date();
    const endsAt = new Date(startsAt);
    endsAt.setMonth(endsAt.getMonth() + subscription.plan.durationMonths);

    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
          startsAt,
          endsAt,
        },
      }),
      prisma.paymentTransaction.create({
        data: {
          subscriptionId: subscription.id,
          amount: subscription.plan.price,
          status: 'success',
          rawPayload: verified,
        },
      }),
    ]);
  }

  if (event === 'charge.failed') {
    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'CANCELLED' },
      }),
      prisma.paymentTransaction.create({
        data: {
          subscriptionId: subscription.id,
          amount: subscription.plan.price,
          status: 'failed',
          rawPayload: payload,
        },
      }),
    ]);
  }
}

export async function getMySubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  });
}