import { Request, Response, NextFunction } from 'express';
import { checkoutSchema } from './subscriptions.validators';
import * as subscriptionsService from './subscriptions.service';

export async function getPlans(_req: Request, res: Response, next: NextFunction) {
  try {
    const plans = await subscriptionsService.getAllPlans();
    res.json(plans);
  } catch (err) {
    next(err);
  }
}

export async function checkout(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.userId;
    const { planId } = checkoutSchema.parse(req.body);
    const result = await subscriptionsService.initiateCheckout(userId, planId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function webhook(req: Request, res: Response, next: NextFunction) {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    await subscriptionsService.handlePaystackWebhook(req.body, signature);
    res.sendStatus(200); // Paystack expects a fast 200 response
  } catch (err) {
    // Still return 200 to avoid Paystack retry storms on our own bugs,
    // but log the error for investigation
    console.error('Webhook processing error:', err);
    res.sendStatus(200);
  }
}

export async function getMySubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.userId;
    const subscription = await subscriptionsService.getMySubscription(userId);
    res.json(subscription ?? { status: 'NONE' });
  } catch (err) {
    next(err);
  }
}