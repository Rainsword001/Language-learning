import { CookieOptions } from 'express';
import { env } from '../config/env';

const isProd = env.NODE_ENV === 'production';

// Production: frontend and API are on different domains, so the cookie
// must be SameSite=None (which browsers only accept together with Secure).
// Development: localhost ports count as same-site, so Lax is fine.
export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/',
};

export const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days