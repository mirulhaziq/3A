import rateLimit from 'express-rate-limit';

const claudeRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many AI requests. Please wait a moment.',
  },
});

const uploadRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many uploads. Please wait a moment.',
  },
});

export { claudeRateLimit, uploadRateLimit };
