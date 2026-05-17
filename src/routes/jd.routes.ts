import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { claudeRateLimit } from '../middleware/ratelimit.middleware';
import * as jdController from '../controllers/jd.controller';

const router = Router();

router.use(authMiddleware);

router.post('/extract', claudeRateLimit, jdController.extract);
router.get('/', jdController.list);
router.get('/:id', jdController.getById);
router.delete('/:id', jdController.deleteById);

export { router as jdRouter };
