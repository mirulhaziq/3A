import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger';

class AuthError extends Error {
  status = 401;
}

class ForbiddenError extends Error {
  status = 403;
}

class NotFoundError extends Error {
  status = 404;
}

function errorMiddleware(
  err: Error & { status?: number },
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    logger.error({ err, stack: err.stack }, err.message);
  } else {
    logger.error({ message: err.message, status: err.status }, 'Request error');
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
    });
    return;
  }

  if (err instanceof AuthError) {
    res.status(401).json({ success: false, error: err.message });
    return;
  }

  if (err instanceof ForbiddenError) {
    res.status(403).json({ success: false, error: err.message });
    return;
  }

  if (err instanceof NotFoundError) {
    res.status(404).json({ success: false, error: err.message });
    return;
  }

  const status = err.status ?? 500;
  const message =
    status === 500 && !isDev ? 'Internal server error' : err.message;

  res.status(status).json({ success: false, error: message });
}

export { errorMiddleware, AuthError, ForbiddenError, NotFoundError };
