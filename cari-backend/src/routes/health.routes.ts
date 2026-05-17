import { Router } from 'express';
import { env } from '../config/env';
import { checkSupabaseConnection } from '../lib/supabase';

const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      service: 'cari-backend',
      status: 'ok',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

healthRouter.get('/db', async (_req, res, next) => {
  try {
    const status = await checkSupabaseConnection();

    res.status(status.connected ? 200 : 503).json({
      success: status.connected,
      data: {
        service: 'supabase',
        ...status,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

export { healthRouter };
