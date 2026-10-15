import { z } from 'zod';

export const completeLessonSchema = z.object({
  lessonId: z.string().uuid(),
});