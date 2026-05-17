import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './lib/logger';
import { router } from './routes';
import { errorMiddleware, NotFoundError } from './middleware/error.middleware';

const app = express();

app.use(pinoHttp({ logger }));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        env.FRONTEND_URL,
        'http://localhost:3000',
        'http://localhost:3001',
      ];

      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.startsWith('chrome-extension://')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      service: 'cari-backend',
      status: 'ok',
      apiBase: env.API_PREFIX,
      health: `${env.API_PREFIX}/health`,
    },
  });
});

app.get('/health', (_req, res) => {
  res.redirect(307, `${env.API_PREFIX}/health`);
});

app.use(env.API_PREFIX, router);

app.use((_req, _res, next) => {
  next(new NotFoundError('Route not found'));
});

app.use(errorMiddleware);

export { app };
