import { Request, Response, NextFunction } from 'express';
import { AuthError, ForbiddenError } from './error.middleware';
import { getProfileByUserId, getSupabaseAuthClient } from '../services/auth.service';
import type { AuthProfile } from '../services/auth.service';
import type { UserRole } from '../types/database.types';

declare global {
  namespace Express {
    interface Request {
      user: AuthProfile;
    }
  }
}

async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthError('Missing bearer token');
    }

    const token = authHeader.slice(7);
    const supabaseAuth = getSupabaseAuthClient();

    const { data, error } = await supabaseAuth.auth.getUser(token);

    if (error || !data.user) {
      throw new AuthError('Invalid or expired token');
    }

    req.user = await getProfileByUserId(data.user.id);

    next();
  } catch (error) {
    next(error);
  }
}

function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AuthError('Authentication required'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError('You do not have permission to access this route'));
      return;
    }

    next();
  };
}

export { authMiddleware, requireRole };
