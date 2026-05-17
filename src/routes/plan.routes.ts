import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { claudeRateLimit } from '../middleware/ratelimit.middleware';
import * as planController from '../controllers/plan.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', planController.getPlan);
router.post('/generate', claudeRateLimit, planController.generate);
router.post('/regenerate', claudeRateLimit, planController.regenerate);
router.patch('/complete/:skillId', planController.completeWeek);

export { router as planRouter };
