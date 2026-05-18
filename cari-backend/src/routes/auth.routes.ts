import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthError } from '../middleware/error.middleware';
import {
  loginSchema,
  refreshSessionSchema,
  registerSchema,
} from '../schemas/auth.schema';
import {
  login,
  refreshSession,
  register,
} from '../services/auth.service';

const authRouter = Router();

authRouter.post('/register', async (req, res, next): Promise<void> => {
  try {
    const input = registerSchema.parse(req.body);
    const data = await register(input);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', async (req, res, next): Promise<void> => {
  try {
    const input = loginSchema.parse(req.body);
    const data = await login(input);
    res.json({ success: true, data });
  } catch (error) {
    // Supabase auth errors (wrong password, user not found) should be 401 not 500
    next(error instanceof AuthError ? error : new AuthError(
      error instanceof Error ? error.message : 'Login failed'
    ));
  }
});

authRouter.post('/refresh', async (req, res, next): Promise<void> => {
  try {
    const input = refreshSessionSchema.parse(req.body);
    const data = await refreshSession(input);
    res.json({ success: true, data });
  } catch (error) {
    next(error instanceof AuthError ? error : new AuthError(
      error instanceof Error ? error.message : 'Token refresh failed'
    ));
  }
});

authRouter.get('/me', authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

export { authRouter };
