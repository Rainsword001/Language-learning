import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  CLIENT_URL: z.string().url(),
  PAYSTACK_SECRET_KEY: z.string().min(1),
  PAYSTACK_PUBLIC_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('Language App <onboarding@resend.dev>'),
}).refine((e) => e.NODE_ENV !== 'production' || !!e.RESEND_API_KEY, {
    message: 'RESEND_API_KEY is required in production',
    path: ['RESEND_API_KEY'],
  });

export const env = envSchema.parse(process.env);