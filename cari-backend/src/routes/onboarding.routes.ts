import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { sseHeaders } from '../middleware/stream.middleware';
import { claudeRateLimit } from '../middleware/ratelimit.middleware';
import * as onboardingController from '../controllers/onboarding.controller';

const router = Router();

router.use(authMiddleware);

router.post('/message', sseHeaders, claudeRateLimit, onboardingController.chat);
router.post('/complete', onboardingController.complete);

export { router as onboardingRouter };
