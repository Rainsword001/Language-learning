import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Zod validation failures -> 400 with per-field details
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  // Malformed JSON body (express.json parse failure) -> 400
  if ((err as any).type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}