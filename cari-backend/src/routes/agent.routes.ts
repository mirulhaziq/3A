import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { claudeRateLimit } from '../middleware/ratelimit.middleware';
import * as agentController from '../controllers/agent.controller';

const router = Router();

router.use(authMiddleware);

router.post('/apply', claudeRateLimit, agentController.apply);
router.post('/apply/confirm', agentController.confirm);
router.post('/followup/approve', agentController.approveFollowup);
router.get('/tracker', agentController.getTracker);
router.get('/staged', agentController.getStaged);

export { router as agentRouter };
