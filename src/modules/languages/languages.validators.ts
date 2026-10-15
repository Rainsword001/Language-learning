import { z } from 'zod';

export const courseQuerySchema = z.object({
  languagePairId: z.string().uuid().optional(),
});

export const setUserLanguageSchema = z.object({
  languagePairId: z.string().uuid(),
});