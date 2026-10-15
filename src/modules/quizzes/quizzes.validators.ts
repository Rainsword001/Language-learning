import { z } from 'zod';

export const submitQuizSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      selectedAnswerId: z.string().uuid(),
    })
  ).min(1),
});