import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { claudeRateLimit } from '../middleware/ratelimit.middleware';
import * as skillsController from '../controllers/skills.controller';

const router = Router();

router.use(authMiddleware);

router.get('/radar', skillsController.getRadar);
router.post('/compare', claudeRateLimit, skillsController.compareJob);
router.patch('/complete/:id', skillsController.completeSkill);

export { router as skillsRouter };
